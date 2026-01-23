import type { DefaultTheme } from "vitepress"

export const nav: DefaultTheme.Config["nav"] = [
  { text: "Homepage", link: "/en" },
  {
    text: "Configuration Guide",
    items: [
      { text: "Feature Details", link: "/en/config/features/" },
      { text: "Basic Configuration", link: "/en/config/" },
      { text: "Inbound Protocols", link: "/en/config/inbounds/" },
      { text: "Outbound Protocols", link: "/en/config/outbounds/" },
      { text: "Transports", link: "/en/config/transports/" }
    ]
  },
  {
    text: "Usage Guide",
    items: [
      { text: "Quick Start", link: "/en/document/" },
      {
        text: "Absolute Beginner's Plain Guide",
        link: "/en/document/level-0/"
      },
      { text: "Beginner Skills", link: "/en/document/level-1/" },
      { text: "Advanced Skills", link: "/en/document/level-2/" }
    ]
  },
  { text: "Developer Guide", link: "/en/development/" },
  { text: "Sponsor & Donation & NFTs", link: "/en/about/sponsor.md" }
]
