import type { DefaultTheme } from "vitepress"

export const nav: DefaultTheme.Config["nav"] = [
  { text: "Homepage", link: "/en" },
  {
    text: "Configuration Guide",
    activeMatch: "^/en/config/",
    items: [
      {
        text: "Feature Details",
        link: "/en/config/features/",
        activeMatch: "^/en/config/features/"
      },
      {
        text: "Basic Configuration",
        link: "/en/config/",
        activeMatch: "^/en/config/[^/]*$"
      },
      {
        text: "Inbound Protocols",
        link: "/en/config/inbounds/",
        activeMatch: "^/en/config/inbounds/"
      },
      {
        text: "Outbound Protocols",
        link: "/en/config/outbounds/",
        activeMatch: "^/en/config/outbounds/"
      },
      {
        text: "Transport Configuration",
        link: "/en/config/transports/",
        activeMatch: "^/en/config/transports/"
      }
    ]
  },
  {
    text: "Usage Guide",
    activeMatch: "^/en/document/",
    items: [
      {
        text: "Quick Start",
        link: "/en/document/",
        activeMatch: "^/en/document/[^/]*$"
      },
      {
        text: "Absolute Beginner's Plain Guide",
        link: "/en/document/level-0/",
        activeMatch: "^/en/document/level-0/"
      },
      {
        text: "Beginner Skills",
        link: "/en/document/level-1/",
        activeMatch: "^/en/document/level-1/"
      },
      {
        text: "Advanced Skills",
        link: "/en/document/level-2/",
        activeMatch: "^/en/document/level-2/"
      }
    ]
  },
  {
    text: "Developer Guide",
    link: "/en/development/",
    activeMatch: "^/en/development/"
  },
  { text: "Sponsor & Donation & NFTs", link: "/en/about/sponsor.md" }
]
