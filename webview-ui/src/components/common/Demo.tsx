import {
	VSCodeBadge,
	VSCodeButton,
	VSCodeCheckbox,
	VSCodeDataGrid,
	VSCodeDataGridCell,
	VSCodeDataGridRow,
	VSCodeDivider,
	VSCodeDropdown,
	VSCodeLink,
	VSCodeOption,
	VSCodePanels,
	VSCodePanelTab,
	VSCodePanelView,
	VSCodeProgressRing,
	VSCodeRadio,
	VSCodeRadioGroup,
	VSCodeTag,
	VSCodeTextArea,
	VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react"
import { useTranslation } from "react-i18next"

function Demo() {
	const { t } = useTranslation("misc")
	const rowData = [
		{
			cell1: t("demo.cellData"),
			cell2: t("demo.cellData"),
			cell3: t("demo.cellData"),
			cell4: t("demo.cellData"),
		},
		{
			cell1: t("demo.cellData"),
			cell2: t("demo.cellData"),
			cell3: t("demo.cellData"),
			cell4: t("demo.cellData"),
		},
		{
			cell1: t("demo.cellData"),
			cell2: t("demo.cellData"),
			cell3: t("demo.cellData"),
			cell4: t("demo.cellData"),
		},
	]

	return (
		<main>
			<h1>{t("demo.helloWorld")}</h1>
			<VSCodeButton>{t("demo.howdy")}</VSCodeButton>

			<div className="grid gap-3 p-2 place-items-start">
				<VSCodeDataGrid>
					<VSCodeDataGridRow row-type="header">
						<VSCodeDataGridCell cell-type="columnheader" grid-column="1">
							{t("demo.customHeaderTitle")}
						</VSCodeDataGridCell>
						<VSCodeDataGridCell cell-type="columnheader" grid-column="2">
							{t("demo.anotherCustomTitle")}
						</VSCodeDataGridCell>
						<VSCodeDataGridCell cell-type="columnheader" grid-column="3">
							{t("demo.titleIsCustom")}
						</VSCodeDataGridCell>
						<VSCodeDataGridCell cell-type="columnheader" grid-column="4">
							{t("demo.customTitle")}
						</VSCodeDataGridCell>
					</VSCodeDataGridRow>
					{rowData.map((row, index) => (
						<VSCodeDataGridRow key={index}>
							<VSCodeDataGridCell grid-column="1">{row.cell1}</VSCodeDataGridCell>
							<VSCodeDataGridCell grid-column="2">{row.cell2}</VSCodeDataGridCell>
							<VSCodeDataGridCell grid-column="3">{row.cell3}</VSCodeDataGridCell>
							<VSCodeDataGridCell grid-column="4">{row.cell4}</VSCodeDataGridCell>
						</VSCodeDataGridRow>
					))}
				</VSCodeDataGrid>

				<VSCodeTextField>
					<section slot="end" style={{ display: "flex", alignItems: "center" }}>
						<VSCodeButton appearance="icon" aria-label={t("demo.matchCase")}>
							<span className="codicon codicon-case-sensitive" />
						</VSCodeButton>
						<VSCodeButton appearance="icon" aria-label={t("demo.matchWholeWord")}>
							<span className="codicon codicon-whole-word" />
						</VSCodeButton>
						<VSCodeButton appearance="icon" aria-label={t("demo.useRegularExpression")}>
							<span className="codicon codicon-regex" />
						</VSCodeButton>
					</section>
				</VSCodeTextField>
				<span className="codicon codicon-chevron-right" slot="end" />

				<span className="flex gap-3">
					<VSCodeProgressRing />
					<VSCodeTextField />
					<VSCodeButton>{t("demo.add")}</VSCodeButton>
					<VSCodeButton appearance="secondary">{t("demo.remove")}</VSCodeButton>
				</span>

				<VSCodeBadge>{t("demo.badge")}</VSCodeBadge>
				<VSCodeCheckbox>{t("demo.checkbox")}</VSCodeCheckbox>
				<VSCodeDivider />
				<VSCodeDropdown>
					<VSCodeOption>{t("demo.option1")}</VSCodeOption>
					<VSCodeOption>{t("demo.option2")}</VSCodeOption>
				</VSCodeDropdown>
				<VSCodeLink href="#">{t("demo.link")}</VSCodeLink>
				<VSCodePanels>
					<VSCodePanelTab id="tab-1">{t("demo.tab1")}</VSCodePanelTab>
					<VSCodePanelTab id="tab-2">{t("demo.tab2")}</VSCodePanelTab>
					<VSCodePanelView id="view-1">{t("demo.panelView1")}</VSCodePanelView>
					<VSCodePanelView id="view-2">{t("demo.panelView2")}</VSCodePanelView>
				</VSCodePanels>
				<VSCodeRadioGroup>
					<VSCodeRadio>{t("demo.radio1")}</VSCodeRadio>
					<VSCodeRadio>{t("demo.radio2")}</VSCodeRadio>
				</VSCodeRadioGroup>
				<VSCodeTag>{t("demo.tag")}</VSCodeTag>
				<VSCodeTextArea placeholder={t("demo.textAreaPlaceholder")} />
			</div>
		</main>
	)
}

export default Demo
