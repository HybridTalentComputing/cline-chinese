import { McpHub } from "@services/mcp/McpHub"

export async function loadMcpDocumentation(mcpHub: McpHub) {
	return `## 创建 MCP 服务器

创建 MCP 服务器时，务必了解它们运行在非交互式环境中。服务器无法在运行时发起 OAuth 流程、打开浏览器窗口或提示用户输入。所有凭据和身份验证令牌必须预先通过 MCP 设置配置中的环境变量提供。例如，Spotify 的 API 使用 OAuth 获取用户的刷新令牌，但 MCP 服务器无法发起此流程。虽然您可以引导用户获取应用程序客户端 ID 和密钥，但您可能需要创建一个单独的一次性设置脚本（例如 get-refresh-token.js），用于捕获并记录最后一步：用户的刷新令牌（例如，您可以使用 execute_command 运行该脚本，这将打开浏览器进行身份验证，然后记录刷新令牌，以便您可以在命令输出中看到它，并在 MCP 设置配置中使用它）。

除非用户另有指定，否则新的 MCP 服务器应在以下位置创建： ${await mcpHub.getMcpServersPath()}

### MCP 服务器示例

例如，如果用户希望您能够获取天气信息，您可以创建一个使用 OpenWeather API 获取天气信息的 MCP 服务器，将其添加到 MCP 设置配置文件中。然后，您会发现系统提示符中出现了新的工具和资源，您可以使用它们向用户展示这些新功能。

以下示例演示了如何构建一个提供天气数据功能的 MCP 服务器。虽然此示例展示了如何实现资源、资源模板和工具，但在实践中，您应该优先使用工具，因为它们更灵活，可以处理动态参数。此处包含资源和资源模板的实现主要是为了演示不同的 MCP 功能，但实际的天气服务器可能只会公开用于获取天气数据的工具。（以下步骤适用于 macOS）

1. 使用 'create-typescript-server' 工具在默认的 MCP 服务器目录中创建一个新项目：

\`\`\`bash
cd ${await mcpHub.getMcpServersPath()}
npx @modelcontextprotocol/create-server weather-server
cd weather-server
# Install dependencies
npm install axios
\`\`\`

这将创建一个具有以下结构的新项目：

\`\`\`
weather-server/
  ├── package.json
      {
        ...
        "type": "module", // added by default, uses ES module syntax (import/export) rather than CommonJS (require/module.exports) (Important to know if you create additional scripts in this server repository like a get-refresh-token.js script)
        "scripts": {
          "build": "tsc && node -e "require('fs').chmodSync('build/index.js', '755')"",
          ...
        }
        ...
      }
  ├── tsconfig.json
  └── src/
      └── weather-server/
          └── index.ts      # Main server implementation
\`\`\`

2. Replace \`src/index.ts\` with the following:

\`\`\`typescript
#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

const API_KEY = process.env.OPENWEATHER_API_KEY; // provided by MCP config
if (!API_KEY) {
  throw new Error('OPENWEATHER_API_KEY environment variable is required');
}

interface OpenWeatherResponse {
  main: {
    temp: number;
    humidity: number;
  };
  weather: [{ description: string }];
  wind: { speed: number };
  dt_txt?: string;
}

const isValidForecastArgs = (
  args: any
): args is { city: string; days?: number } =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.city === 'string' &&
  (args.days === undefined || typeof args.days === 'number');

class WeatherServer {
  private server: Server;
  private axiosInstance;

  constructor() {
    this.server = new Server(
      {
        name: 'example-weather-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.axiosInstance = axios.create({
      baseURL: 'http://api.openweathermap.org/data/2.5',
      params: {
        appid: API_KEY,
        units: 'metric',
      },
    });

    this.setupResourceHandlers();
    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  // MCP Resources represent any kind of UTF-8 encoded data that an MCP server wants to make available to clients, such as database records, API responses, log files, and more. Servers define direct resources with a static URI or dynamic resources with a URI template that follows the format \`[protocol]://[host]/[path]\`.
  private setupResourceHandlers() {
    // For static resources, servers can expose a list of resources:
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        // This is a poor example since you could use the resource template to get the same information but this demonstrates how to define a static resource
        {
          uri: \`weather://San Francisco/current\`, // Unique identifier for San Francisco weather resource
          name: \`Current weather in San Francisco\`, // Human-readable name
          mimeType: 'application/json', // Optional MIME type
          // Optional description
          description:
            'Real-time weather data for San Francisco including temperature, conditions, humidity, and wind speed',
        },
      ],
    }));

    // For dynamic resources, servers can expose resource templates:
    this.server.setRequestHandler(
      ListResourceTemplatesRequestSchema,
      async () => ({
        resourceTemplates: [
          {
            uriTemplate: 'weather://{city}/current', // URI template (RFC 6570)
            name: 'Current weather for a given city', // Human-readable name
            mimeType: 'application/json', // Optional MIME type
            description: 'Real-time weather data for a specified city', // Optional description
          },
        ],
      })
    );

    // ReadResourceRequestSchema is used for both static resources and dynamic resource templates
    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request) => {
        const match = request.params.uri.match(
          /^weather://([^/]+)/current$/
        );
        if (!match) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            \`Invalid URI format: \${request.params.uri}\`
          );
        }
        const city = decodeURIComponent(match[1]);

        try {
          const response = await this.axiosInstance.get(
            'weather', // current weather
            {
              params: { q: city },
            }
          );

          return {
            contents: [
              {
                uri: request.params.uri,
                mimeType: 'application/json',
                text: JSON.stringify(
                  {
                    temperature: response.data.main.temp,
                    conditions: response.data.weather[0].description,
                    humidity: response.data.main.humidity,
                    wind_speed: response.data.wind.speed,
                    timestamp: new Date().toISOString(),
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new McpError(
              ErrorCode.InternalError,
              \`Weather API error: \${
                error.response?.data.message ?? error.message
              }\`
            );
          }
          throw error;
        }
      }
    );
  }

  /* MCP Tools enable servers to expose executable functionality to the system. Through these tools, you can interact with external systems, perform computations, and take actions in the real world.
   * - Like resources, tools are identified by unique names and can include descriptions to guide their usage. However, unlike resources, tools represent dynamic operations that can modify state or interact with external systems.
   * - While resources and tools are similar, you should prefer to create tools over resources when possible as they provide more flexibility.
   */
  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_forecast', // Unique identifier
          description: 'Get weather forecast for a city', // Human-readable description
          inputSchema: {
            // JSON Schema for parameters
            type: 'object',
            properties: {
              city: {
                type: 'string',
                description: 'City name',
              },
              days: {
                type: 'number',
                description: 'Number of days (1-5)',
                minimum: 1,
                maximum: 5,
              },
            },
            required: ['city'], // Array of required property names
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== 'get_forecast') {
        throw new McpError(
          ErrorCode.MethodNotFound,
          \`Unknown tool: \${request.params.name}\`
        );
      }

      if (!isValidForecastArgs(request.params.arguments)) {
        throw new McpError(
          ErrorCode.InvalidParams,
          'Invalid forecast arguments'
        );
      }

      const city = request.params.arguments.city;
      const days = Math.min(request.params.arguments.days || 3, 5);

      try {
        const response = await this.axiosInstance.get<{
          list: OpenWeatherResponse[];
        }>('forecast', {
          params: {
            q: city,
            cnt: days * 8,
          },
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data.list, null, 2),
            },
          ],
        };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          return {
            content: [
              {
                type: 'text',
                text: \`Weather API error: \${
                  error.response?.data.message ?? error.message
                }\`,
              },
            ],
            isError: true,
          };
        }
        throw error;
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Weather MCP server running on stdio');
  }
}

const server = new WeatherServer();
server.run().catch(console.error);
\`\`\`

(Remember: This is just an example–you may use different dependencies, break the implementation up into multiple files, etc.)

3. Build and compile the executable JavaScript file

\`\`\`bash
npm run build
\`\`\`

4. Whenever you need an environment variable such as an API key to configure the MCP server, walk the user through the process of getting the key. For example, they may need to create an account and go to a developer dashboard to generate the key. Provide step-by-step instructions and URLs to make it easy for the user to retrieve the necessary information. Then use the ask_followup_question tool to ask the user for the key, in this case the OpenWeather API key.

5. Install the MCP Server by adding the MCP server configuration to the settings file located at '${await mcpHub.getMcpSettingsFilePath()}'. The settings file may have other MCP servers already configured, so you would read it first and then add your new server to the existing \`mcpServers\` object.

IMPORTANT: Regardless of what else you see in the MCP settings file, you must default any new MCP servers you create to disabled=false and autoApprove=[].

\`\`\`json
{
  "mcpServers": {
    ...,
    "weather": {
      "command": "node",
      "args": ["/path/to/weather-server/build/index.js"],
      "env": {
        "OPENWEATHER_API_KEY": "user-provided-api-key"
      }
    },
  }
}
\`\`\`

(Note: the user may also ask you to install the MCP server to the Claude desktop app, in which case you would read then modify \`~/Library/Application Support/Claude/claude_desktop_config.json\` on macOS for example. It follows the same format of a top level \`mcpServers\` object.)

6. After you have edited the MCP settings configuration file, the system will automatically run all the servers and expose the available tools and resources in the 'Connected MCP Servers' section. (Note: If you encounter a 'not connected' error when testing a newly installed mcp server, a common cause is an incorrect build path in your MCP settings configuration. Since compiled JavaScript files are commonly output to either 'dist/' or 'build/' directories, double-check that the build path in your MCP settings matches where your files are actually being compiled. E.g. If you assumed 'build' as the folder, check tsconfig.json to see if it's using 'dist' instead.)

7. Now that you have access to these new tools and resources, you may suggest ways the user can command you to invoke them - for example, with this new weather tool now available, you can invite the user to ask "what's the weather in San Francisco?"

## Editing MCP Servers

The user may ask to add tools or resources that may make sense to add to an existing MCP server (listed under 'Connected MCP Servers' below: ${
		mcpHub
			.getServers()
			.filter((server) => server.status === "connected")
			.map((server) => server.name)
			.join(", ") || "(None running currently)"
	}, e.g. 如果它使用相同的 API。如果您可以通过查看服务器参数中的文件路径来定位用户系统上的 MCP 服务器仓库，那么就可以实现这一点。然后，您可以使用 list_files 和 read_file 来浏览仓库中的文件，并使用 replace_in_file 来修改文件。

但是，有些 MCP 服务器可能运行在已安装的软件包上，而不是本地仓库中，在这种情况下，创建一个新的 MCP 服务器可能更有意义。

# MCP 服务器并非总是必需的

用户并非总是请求使用或创建 MCP 服务器。相反，他们可能会提出一些可以使用现有工具完成的任务。虽然使用 MCP SDK 来扩展您的功能很有用，但重要的是要理解，这只是您可以完成的一种特定类型的任务。您应该仅在用户明确请求时才实现 MCP 服务器（例如，“添加一个可以……”的工具）。

请记住：以上提供的 MCP 文档和示例旨在帮助您理解和使用现有的 MCP 服务器，或根据用户请求创建新的服务器。您已经拥有可用于完成各种任务的工具和功能。`
}
