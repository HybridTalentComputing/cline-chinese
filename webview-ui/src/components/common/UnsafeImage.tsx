import type { ComponentProps } from "react"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"

type UnsafeImageProps = ComponentProps<"img">

const UnsafeImage: React.FC<UnsafeImageProps> = ({ src = "", alt = "", ...imgProps }) => {
	const { t } = useTranslation("misc")
	const [approvedSrc, setApprovedSrc] = useState<string>()
	const isApproved = approvedSrc === src

	if (!src) {
		return null
	}

	// If it's base-64 encoded image (starts with `data:`), we can render it regardless of consent
	if (!isApproved && !src.startsWith("data:")) {
		return (
			<span className="my-2 block flex flex-col rounded-md border border-input-border bg-code p-3">
				<span className="block m-0 text-sm font-medium">{t("common.unsafeImage.blocked")}</span>
				<span className="block mt-2 mb-0 break-all text-xs text-muted-foreground">
					{t("common.unsafeImage.source")}
					<code>{src}</code>
					{alt && (
						<>
							<br />
							{t("common.unsafeImage.alt")}
							<code>{alt}</code>
						</>
					)}
				</span>
				<Button className="mt-3" onClick={() => setApprovedSrc(src)} type="button" variant="outline">
					{t("common.unsafeImage.loadImage")}
				</Button>
			</span>
		)
	}

	return <img alt={alt} src={src} {...imgProps} />
}

export default UnsafeImage
