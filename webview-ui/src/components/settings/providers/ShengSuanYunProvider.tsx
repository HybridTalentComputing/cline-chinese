import { ShengSuanYunAccountInfoCard } from "../ShengSuanYunAccountInfoCard"
import ShengSuanYunModelPicker from "../ShengSuanYunModelPicker"

interface ShengSuanYunProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
}

export const ShengSuanYunProvider = ({ showModelOptions, isPopup }: ShengSuanYunProviderProps) => {
	return (
		<div>
			<div style={{ marginBottom: 14, marginTop: 4 }}>
				<ShengSuanYunAccountInfoCard />
			</div>
			{showModelOptions && <ShengSuanYunModelPicker isPopup={isPopup} />}
		</div>
	)
}
