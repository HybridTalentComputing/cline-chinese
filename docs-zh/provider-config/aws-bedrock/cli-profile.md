---
title: "CLI 配置文件 (SSO)"
sidebarTitle: "CLI 配置文件 (SSO)"
description: "配置 AWS Bedrock 以使用 AWS CLI 配置文件与 Cline 进行身份验证。最适合 SSO/联合角色和安全的企业访问。"
---

### 概述

Cline 提供利用 AWS 凭证或 AWS 配置文件访问 AWS Bedrock 服务的选项。建议使用 SSO/联合角色而不是传统 IAM 配置；本指南描述了如何配置您的环境，以便 Cline 使用 SSO 角色进行身份验证。

---

### 配置步骤

1.  安装 AWS CLI 的[最新版本](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

    -   按照 AWS 文档安装您的操作系统特定版本的 AWS CLI

2.  使用 AWS CLI [配置 IAM 身份验证](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html)

    -   如果您尚未通过 IAM Identity Center 获得 AWS 访问权限，请按照 [IAM 用户指南](https://docs.aws.amazon.com/singlesignon/latest/userguide/getting-started.html)设置 IAM 用户和角色。确保您具有 `PowerUserAccess` 角色。
    -   如果您通过雇主有权访问 AWS，请打开您的 AWS 访问门户并找到合适的账户。确保您具有 `PowerUserAccess` 权限。
    -   打开 `Access keys` 链接并记下 `SSO start URL` 和 `SSO region`，这些在下一步中需要

3.  继续使用 [`aws configure sso` CLI 向导](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html#cli-configure-sso-configure)配置您的配置文件

    -   配置完成后，使用以下命令对 AWS CLI 进行身份验证：`aws sso login --profile <AWS-profile-name>`
    -   记下您附加到 AWS 账户的配置文件名称，这需要在以下步骤中配置 Cline

4.  如果您尚未完成，请安装 VSCode 和 Cline 扩展。请参阅[入门](/getting-started)页面获取指导。

5.  打开 Cline 扩展，然后点击设置按钮 ⚙️ 以选择您的 API 提供商。
    -   从 API 提供商下拉菜单中，选择 AWS Bedrock
    -   选择 AWS 配置文件单选按钮，然后输入步骤 3 中的 AWS 配置文件名称
    -   从下拉菜单中选择您的 AWS 区域
    -   某些模型需要勾选跨区域推理复选框

<Frame>
	<img
		src="https://storage.googleapis.com/cline_public_images/docs/assets/cline-aws-setup-markup%20(1).png"
		alt="Cline 设置中的 AWS Bedrock 配置，显示配置文件身份验证设置"
		/>
</Frame>
