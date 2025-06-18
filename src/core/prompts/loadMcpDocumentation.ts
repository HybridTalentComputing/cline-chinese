import { McpHub } from "@services/mcp/McpHub"

export async function loadMcpDocumentation(mcpHub: McpHub) {
	return `## 创建 MCP 服务器

创建 MCP 服务器时，重要的是要理解它们在非交互式环境中运行。服务器无法启动 OAuth 流程、打开浏览器窗口或在运行时提示用户输入。所有凭证和认证令牌必须通过 MCP 设置配置中的环境变量预先提供。例如，Spotify 的 API 使用 OAuth 获取用户的刷新令牌，但 MCP 服务器无法启动此流程。虽然你可以指导用户获取应用程序客户端 ID 和密钥，但你可能需要创建一个单独的一次性设置脚本（如 get-refresh-token.js），该脚本捕获并记录最终的关键信息：用户的刷新令牌（即你可能使用 execute_command 运行脚本，这将打开浏览器进行认证，然后记录刷新令牌，以便你可以在命令输出中看到它，供你在 MCP 设置配置中使用）。

除非用户另有指定，否则新的 MCP 服务器应创建在：${await mcpHub.getMcpServersPath()}

### MCP 服务器示例

例如，如果用户想让你能够检索天气信息，你可以创建一个使用 OpenWeather API 获取天气信息的 MCP 服务器，将其添加到 MCP 设置配置文件中，然后注意到你现在可以在系统提示中访问新的工具和资源，你可以使用这些工具和资源向用户展示你的新功能。

以下示例演示了如何构建提供天气数据功能的 MCP 服务器。虽然此示例展示了如何实现资源、资源模板和工具，但在实践中你应该优先使用工具，因为它们更灵活，可以处理动态参数。资源和资源模板实现主要是为了演示不同的 MCP 功能，但实际的天气服务器可能只会公开用于获取天气数据的工具。（以下步骤适用于 macOS）

1. 使用 \`create-typescript-server\` 工具在默认 MCP 服务器目录中引导新项目：

\`\`\`bash
cd ${await mcpHub.getMcpServersPath()}
npx @modelcontextprotocol/create-server weather-server
cd weather-server
# 安装依赖
npm install axios
\`\`\`

这将创建具有以下结构的新项目：

\`\`\`
weather-server/
  ├── package.json
      {
        ...
        "type": "module", // 默认添加，使用 ES 模块语法（import/export）而不是 CommonJS（require/module.exports）（如果你在此服务器存储库中创建其他脚本（如 get-refresh-token.js），这一点很重要）
        "scripts": {
          "build": "tsc && node -e \"require('fs').chmodSync('build/index.js', '755')\"",
          ...
        }
        ...
      }
  ├── tsconfig.json
  └── src/
      └── weather-server/
          └── index.ts      # 主服务器实现
\`\`\`

2. 用以下内容替换 \`src/index.ts\`：

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

const API_KEY = process.env.OPENWEATHER_API_KEY; // 由 MCP 配置提供
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
    
    // 错误处理
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  // MCP 资源表示 MCP 服务器想要提供给客户端的任何类型的 UTF-8 编码数据，如数据库记录、API 响应、日志文件等。服务器定义具有静态 URI 的直接资源或具有遵循格式 \`[protocol]://[host]/[path]\` 的 URI 模板的动态资源。
  private setupResourceHandlers() {
    // 对于静态资源，服务器可以公开资源列表：
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        // 这是一个不太好的例子，因为你可以使用资源模板获取相同的信息，但这演示了如何定义静态资源
        {
          uri: \`weather://San Francisco/current\`, // 旧金山天气资源的唯一标识符
          name: \`Current weather in San Francisco\`, // 人类可读的名称
          mimeType: 'application/json', // 可选的 MIME 类型
          // 可选的描述
          description:
            'Real-time weather data for San Francisco including temperature, conditions, humidity, and wind speed',
        },
      ],
    }));

    // 对于动态资源，服务器可以公开资源模板：
    this.server.setRequestHandler(
      ListResourceTemplatesRequestSchema,
      async () => ({
        resourceTemplates: [
          {
            uriTemplate: 'weather://{city}/current', // URI 模板（RFC 6570）
            name: 'Current weather for a given city', // 人类可读的名称
            mimeType: 'application/json', // 可选的 MIME 类型
            description: 'Real-time weather data for a specified city', // 可选的描述
          },
        ],
      })
    );

    // ReadResourceRequestSchema 用于静态资源和动态资源模板
    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request) => {
        const match = request.params.uri.match(
          /^weather:\/\/([^/]+)\/current$/
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
            'weather', // 当前天气
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

  /* MCP 工具使服务器能够向系统公开可执行功能。通过这些工具，你可以与外部系统交互，执行计算，并在现实世界中采取行动。
   * - 与资源一样，工具由唯一名称标识，并可包含描述以指导其使用。然而，与资源不同，工具代表可以修改状态或与外部系统交互的动态操作。
   * - 虽然资源和工具相似，但你应该尽可能优先创建工具而不是资源，因为它们提供更大的灵活性。
   */
  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_forecast', // 唯一标识符
          description: 'Get weather forecast for a city', // 人类可读的描述
          inputSchema: {
            // 参数的 JSON Schema
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
            required: ['city'], // 必需属性名称的数组
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

（请记住：这只是一个示例——你可以使用不同的依赖项，将实现分解为多个文件等。）

3. 构建并编译可执行的 JavaScript 文件

\`\`\`bash
npm run build
\`\`\`

4. 当你需要环境变量（如 API 密钥）来配置 MCP 服务器时，引导用户获取密钥的过程。例如，他们可能需要创建账户并前往开发者仪表板生成密钥。提供逐步说明和 URL，使用户能够轻松检索必要的信息。然后使用 ask_followup_question 工具向用户询问密钥，在这种情况下是 OpenWeather API 密钥。

5. 通过将 MCP 服务器配置添加到位于 '${await mcpHub.getMcpSettingsFilePath()}' 的设置文件来安装 MCP 服务器。设置文件可能已经配置了其他 MCP 服务器，因此你应该先读取它，然后将你的新服务器添加到现有的 \`mcpServers\` 对象中。

重要：无论你在 MCP 设置文件中看到什么，你必须将任何新创建的 MCP 服务器默认设置为 disabled=false 和 autoApprove=[]。

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

（注意：用户也可能要求你将 MCP 服务器安装到 Claude 桌面应用程序，在这种情况下，你将读取然后修改 macOS 上的 \`~/Library/Application\ Support/Claude/claude_desktop_config.json\`。它遵循相同的格式，即顶级 \`mcpServers\` 对象。）

6. 编辑 MCP 设置配置文件后，系统将自动运行所有服务器，并在"已连接的 MCP 服务器"部分公开可用的工具和资源。（注意：如果在测试新安装的 MCP 服务器时遇到"未连接"错误，常见原因是 MCP 设置配置中的构建路径不正确。由于编译的 JavaScript 文件通常输出到 'dist/' 或 'build/' 目录，请仔细检查 MCP 设置中的构建路径是否与文件实际编译的位置匹配。例如，如果你假设文件夹是 'build'，请检查 tsconfig.json 是否使用的是 'dist'。）

7. 现在你可以访问这些新工具和资源，你可以建议用户命令你调用它们的方式 - 例如，有了这个新的天气工具，你可以邀请用户询问"旧金山的天气如何？"

## 编辑 MCP 服务器

用户可能会要求添加工具或资源，这些工具或资源可能适合添加到现有的 MCP 服务器中（在下面的"已连接的 MCP 服务器"下列出：${
		mcpHub
			.getServers()
			.filter((server) => server.status === "connected")
			.map((server) => server.name)
			.join(", ") || "(当前没有运行的服务器)"
	}，例如，如果它们使用相同的 API。如果你能够通过查看服务器参数中的文件路径在用户系统上找到 MCP 服务器存储库，这是可能的。然后，你可能会使用 list_files 和 read_file 来探索存储库中的文件，并使用 replace_in_file 对文件进行更改。

然而，一些 MCP 服务器可能是从已安装的包而不是本地存储库运行的，在这种情况下，创建一个新的 MCP 服务器可能更有意义。

# MCP 服务器并非总是必需的

用户可能并不总是要求使用或创建 MCP 服务器。相反，他们可能提供可以使用现有工具完成的任务。虽然使用 MCP SDK 扩展你的功能可能很有用，但重要的是要理解这只是你可以完成的一种专门类型的任务。只有当用户明确要求时（例如，"添加一个工具，可以..."），你才应该实现 MCP 服务器。

记住：上面提供的 MCP 文档和示例是为了帮助你理解和使用现有的 MCP 服务器，或在用户要求时创建新的服务器。你已经可以访问可用于完成各种任务的工具和功能。`
}
