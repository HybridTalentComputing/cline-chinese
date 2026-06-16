import { act, render, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ClineAccountView } from "./AccountView"

const { mockGetUserCredits, mockGetOrganizationCredits, mockSetUserOrganization, mockHandleSignOut } = vi.hoisted(() => ({
	mockGetUserCredits: vi.fn(),
	mockGetOrganizationCredits: vi.fn(),
	mockSetUserOrganization: vi.fn(),
	mockHandleSignOut: vi.fn(),
}))

vi.mock("react-i18next", () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}))

vi.mock("react-use", () => ({
	useInterval: vi.fn(),
}))

vi.mock("@/context/ExtensionStateContext", () => ({
	useExtensionState: () => ({
		remoteConfigSettings: {},
		environment: "production",
	}),
}))

vi.mock("@shared/internal/account", () => ({
	isClineInternalTester: () => false,
}))

vi.mock("@/context/ClineAuthContext", () => ({
	handleSignOut: mockHandleSignOut,
}))

vi.mock("@/services/grpc-client", () => ({
	AccountServiceClient: {
		getUserCredits: mockGetUserCredits,
		getOrganizationCredits: mockGetOrganizationCredits,
		setUserOrganization: mockSetUserOrganization,
	},
}))

vi.mock("@/components/ui/tooltip", () => ({
	Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	TooltipTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	TooltipContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock("@vscode/webview-ui-toolkit/react", () => ({
	VSCodeButton: ({ children, onClick, className }: any) => (
		<button className={className} onClick={onClick} type="button">
			{children}
		</button>
	),
	VSCodeDivider: ({ className }: any) => <div className={className} data-testid="divider" />,
	VSCodeDropdown: ({ children, currentValue, disabled, onChange, className }: any) => (
		<select className={className} disabled={disabled} onChange={onChange} value={currentValue}>
			{children}
		</select>
	),
	VSCodeOption: ({ children, value }: any) => <option value={value}>{children}</option>,
	VSCodeTag: ({ children, className }: any) => <span className={className}>{children}</span>,
}))

vi.mock("../common/VSCodeButtonLink", () => ({
	default: ({ children, href, className }: any) => (
		<a className={className} href={href}>
			{children}
		</a>
	),
}))

vi.mock("../common/ViewHeader", () => ({
	default: () => <div data-testid="view-header" />,
}))

vi.mock("./AccountWelcomeView", () => ({
	AccountWelcomeView: () => <div data-testid="account-welcome-view" />,
}))

vi.mock("./CreditBalance", () => ({
	CreditBalance: ({ balance }: { balance: number | null }) => <div data-testid="credit-balance">{balance}</div>,
}))

vi.mock("./CreditsHistoryTable", () => ({
	default: () => <div data-testid="credits-history-table" />,
}))

vi.mock("./RemoteConfigToggle", () => ({
	RemoteConfigToggle: () => <div data-testid="remote-config-toggle" />,
}))

describe("ClineAccountView", () => {
	beforeEach(() => {
		vi.clearAllMocks()
		mockGetUserCredits.mockResolvedValue({
			balance: { currentBalance: 42 },
			usageTransactions: [],
			paymentTransactions: [],
		})
		mockGetOrganizationCredits.mockResolvedValue({
			balance: { currentBalance: 100 },
			usageTransactions: [],
		})
		mockSetUserOrganization.mockResolvedValue({})
	})

	it("fetches user credits only once on initial mount", async () => {
		render(
			<ClineAccountView
				activeOrganization={null}
				clineEnv="Production"
				clineUser={{
					uid: "usr-123",
					email: "test@example.com",
					displayName: "Test User",
					appBaseUrl: "https://app.cline.bot",
				}}
				userOrganizations={null}
			/>,
		)

		await waitFor(() => {
			expect(mockGetUserCredits).toHaveBeenCalledTimes(1)
		})

		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 50))
		})

		expect(mockGetUserCredits).toHaveBeenCalledTimes(1)
		expect(mockGetOrganizationCredits).not.toHaveBeenCalled()
	})
})
