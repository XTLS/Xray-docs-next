import type { DefaultTheme } from "vitepress";

export const nav: DefaultTheme.Config["nav"] = [
  { text: "Homepage", link: "/en" },
  {
    text: "Configuration Guide",
    items: [
      { text: "Feature Details", link: "/en/config/features/" },
      { text: "Basic Configuration", link: "/en/config/" },
      { text: "Inbound Protocols", link: "/en/config/inbounds/" },
      { text: "Outbound Protocols", link: "/en/config/outbounds/" },
      { text: "Underlying Transports", link: "/en/config/transports/" },
    ],
  },
  {
    text: "Usage Guide",
    items: [
      { text: "Quick Start", link: "/en/document/" },
      {
        text: "Beginner's Plain Language Guide",
        link: "/en/document/level-0/",
      },
      { text: "Beginner Tips", link: "/en/document/level-1/" },
      { text: "Advanced Tips", link: "/en/document/level-2/" },
    ],
  },
  { text: "Developer Guide", link: "/en/development/" },
  { text: "Sponsor & Donation & NFTs", link: "/en/about/sponsor.md" },
];
