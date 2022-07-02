import { Icon, IconProps } from "@chakra-ui/react"
import { SVGProps } from "react"

const SendIconSVG = (props: IconProps) => (
  <Icon
    style={{
      width: 24,
      height: 24,
    }}
    viewBox="0 0 24 24"
    {...props}
  >
    <path fill="currentColor" d="m2 21 21-9L2 3v7l15 2-15 2v7Z" />
  </Icon>
)

export default SendIconSVG
