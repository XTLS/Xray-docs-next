# Xray working mode

## Single Server Mode

Like other network proxy tools, you need a server with Xray configured, then install and configure the Xray client on your device, and then you can access the Internet smoothly.

```mermaid
graph LR;
A(PC) -.- B(firewall);
B -.-> C(Websites outside the Great Firewall);
A --> D(Xray/VPS);
D --> C;
A --> E(Websites within the wall);
```

An Xray server can support multiple devices using different proxy protocols to access at the same time. At the same time, after reasonable configuration, Xray can identify and distinguish between traffic that needs proxy and traffic that does not need proxy, and direct traffic does not need to be detoured.

## Bridge mode

If you don't want to configure routing on each device, you can also set up a transit server to receive all traffic sent by the client and then forward it in the server.

```mermaid
graph LR;
A(PC) -.-> B(firewall);
B -.-> C(Websites outside the Great Firewall);
A --> D(Inside the wall VPS);
D --> E(Outside the Wall VPS);
E --> C;
D --> F(Websites within the wall);
```

## Working Principle

Before configuring Xray, let's take a look at how Xray works. The following is a schematic diagram of the internal structure of a single Xray process. Multiple Xrays are independent of each other and do not affect each other.

```mermaid
graph LR;
A1(inbound) --> D(Dispatcher / Router / DNS);
A2(inbound) --> D;
A3(inbound) --> D;
A4(inbound) --> D;
D --> B1(outbound);
D --> B2(outbound);
D --> B3(outbound);
D --> B4(outbound);
```

- You need to configure at least one inbound connection (Inbound) and one outbound connection (Outbound) for it to work properly.
  - Inbound connections are responsible for communicating with clients such as browsers:
    - Inbound connections can usually be configured with user authentication, such as ID and password;
    - After the inbound connection receives the data, it will be handed over to the Dispatcher for distribution;
  - Outbound connections are responsible for sending data to a server, such as Xray on another host.
- When there are multiple outbound connections, you can configure routing to specify that a certain type of traffic is sent from a certain outbound connection.
  - The router will query DNS for more information when necessary to make a decision.
