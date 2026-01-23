# VLESS Protocol

VLESS is a stateless lightweight transport protocol that serves as a bridge between Xray clients and servers.

## Request & Response

| 1 Byte           | 16 Bytes        | 1 Byte          | M Bytes         | 1 Byte  | 2 Bytes | 1 Byte       | S Bytes | X Bytes      |
| :--------------- | :-------------- | :-------------- | :-------------- | :------ | :------ | :----------- | :------ | :----------- |
| Protocol Version | Equivalent UUID | Addons Length M | Addons ProtoBuf | Command | Port    | Address Type | Address | Request Data |

| 1 Byte                            | 1 Byte          | N Bytes         | Y Bytes       |
| :-------------------------------- | :-------------- | :-------------- | :------------ |
| Protocol Version, same as request | Addons Length N | Addons ProtoBuf | Response Data |

VLESS has had the above structure since the second alpha version, ALPHA 2 (BETA is the fifth test version):

> "Response Authentication" was replaced by "Protocol Version" and moved to the very front, allowing VLESS to be upgraded while eliminating the overhead of generating pseudo-random numbers. Obfuscation-related structures were replaced by Addons (ProtoBuf) and moved forward, giving the protocol itself extensibility with minimal overhead ([gogo/protobuf](https://github.com/gogo/protobuf)); there is no related overhead if there are no Addons.

I always felt that "Response Authentication" wasn't necessary. In ALPHA, to improve the performance of random number generation, `math/rand` replaced `crypto/rand`, but now neither is needed.

"Protocol Version" not only serves the function of "Response Authentication" but also gives VLESS the ability to upgrade protocol structures painlessly, bringing infinite possibilities.
The "Protocol Version" is 0 in test versions and 1 in official versions. If there are incompatible protocol structure changes in the future, the version should be upgraded.

The design of the VLESS server is "switch version," meaning it supports all VLESS versions simultaneously. If a protocol version upgrade is needed (we might not reach that step), the recommended practice is for the server to support it a month in advance, and update clients a month later. VMess requests also have a protocol version, but its authentication information is outside, while the command part is highly coupled and has fixed encryption, making the inner protocol version meaningless. The server doesn't check it, and the response has no protocol version. The Trojan protocol structure has no protocol version.

Next is the UUID. I initially thought 16 bytes was a bit long and considered shortening it, but after seeing Trojan use 56 printable characters (56 bytes), I completely dismissed that thought. The server verifies the UUID every time, so performance is crucial: The VLESS Validator has undergone multiple refactors/upgrades. Compared to VMess, it is extremely concise and resource-efficient, capable of supporting a very large number of users simultaneously, with robust performance and extremely fast verification speed (sync.Map). Adding or deleting users dynamically via API is also more efficient and smoother.
<https://github.com/XTLS/Xray-core/issues/158>

Introducing ProtoBuf is a pioneering move, which will be explained in detail later. The structure from "Command" to "Address" is currently identical to VMess and also supports Mux.

Overall, from ALPHA 2 to BETA, the changes were mainly: structural evolution, cleanup and integration, performance improvement, and greater perfection. These happened bit by bit; see [VLESS Changes](https://github.com/rprx/v2ray-vless/releases) for details.

## ProtoBuf

It seems only VLESS allows optional embedded ProtoBuf. It is a data exchange format where information is tightly encoded into binary in a TLV structure (Tag Length Value).

The origin was an article I read stating that SS has some shortcomings, such as lacking an error reporting mechanism design, meaning clients cannot take further actions based on different errors.
(I don't agree that all errors should be reported; otherwise, active probing cannot be prevented. In the next beta, the server can return a string of custom information.)
So I realized an extensible structure is important. In the future, it could also carry things like dynamic port commands. Not just responses, requests also need a similar structure.
I originally planned to design TLV myself, but then realized ProtoBuf _is_ this structure, a ready-made wheel perfectly suitable for this task, with good language support.

Currently, "Addons" only contain Scheduler and SchedulerV, which replace MessName and MessSeed. **When you don't need them, "Addons Length" is 0, so there is no ProtoBuf serialization/deserialization overhead.** Actually, I prefer to call this process "splicing" because that's what pb effectively does in principle, with minimal overhead. The spliced bytes are very compact, hardly different from the ALPHA scheme. Those interested can output and compare them separately.

To indicate different levels of support for Addons (can be understood as plugins; there can be many plugins in the future), the next beta will add an "Addons Version" before "Addons Length". 256 - 1 = 255 bytes is sufficient and reasonable (65535 is too much and might be maliciously filled). Current usage is only one-tenth of that. There won't be that many Addons simultaneously in the future, and in most cases, there are no Addons at all. If it really isn't enough, the VLESS version can be upgraded.

To reduce overhead like logic checks, it is tentatively decided that Addons will not use a multi-level structure. A month ago, there was an idea of "variable protocol format". pb can shuffle order, but it's unnecessary because modern encryption designs prevent observers from seeing that two transmissions have the same header.

Below introduces the concepts of Schedulers and Encryption. **Both are optional.** One addresses traffic timing characteristics, and the other addresses cryptographic issues.

## ~~Schedulers~~ Flow

~~Tentative Chinese name: Traffic Scheduler~~ (Updated 2020-09-03: Chinese name confirmed as "Flow Control"). Instructions are carried by ProtoBuf, controlling the data part.

I previously found that VMess's original shake "metadata obfuscation" brought no meaningful changes over TLS, only reducing performance, so VLESS deprecated it. Also, the term "obfuscation" is easily misunderstood as camouflage, so it was also deprecated. By the way, I've never been optimistic about camouflage: if it can't be exactly the same, isn't that a strong characteristic? If it can be exactly the same, why not just use the camouflage target directly? I used SSR at first, later found out it only superficially fooled ISPs, and never used it again.

So, what problem does the "Traffic Scheduler" solve? It affects macroscopic traffic timing characteristics, not microscopic characteristics (which encryption solves). Traffic timing characteristics can be protocol-induced, like the Socks5 handshake in Socks5 over TLS; different characteristics on TLS look like different protocols to monitors. Infinite Schedulers would be equivalent to infinite protocols (redistributing the data size sent each time, etc.). Traffic timing characteristics can also be behavior-induced, such as how many files are loaded when visiting the Google homepage, the order, and the size of each file. Adding another layer of encryption doesn't effectively mask this information.

Schedulers don't need to wrap everything on the outside like Encryption below, because the tiny amount of header data is negligible compared to the subsequent data volume.

BETA 2 is expected to launch two elementary Schedulers: Zstd compression and dynamic data expansion. Advanced operations involve controlling and allocating from a macro level, which is postponed for now.

## Encryption

Unlike VMess's high coupling, VLESS servers and clients will soon be able to agree on an encryption method in advance, wrapping only one layer of encryption on the outside. This is somewhat similar to using TLS; it doesn't affect any carried data and can be understood as swapping the underlying layer from TLS to a preset agreed encryption. Compared to high coupling, this method is more reasonable and flexible: if a security issue arises with one encryption method, just discard it and switch to another, very convenient. VLESS servers will also allow different encryption methods to coexist.

Compared to VMess, VLESS effectively replaces `security` with `encryption` and `disableInsecureEncryption` with `decryption`, solving all problems. Currently, `encryption` and `decryption` only accept "none" and cannot be empty (even if connection security checks are added later). See [VLESS Configuration Documentation](https://github.com/rprx/v2fly-github-io/blob/master/docs/config/protocols/vless.md) for details. `encryption` doesn't need to be moved out one level, firstly because a lot of code can't be reused, and secondly because it affects control granularity. Future applications will make this clear.

Encryption supports two forms. One is completely independent encryption requiring an extra password, suitable for private use. The other combines with the existing UUID for encryption, suitable for public use.
(If the first form is used and the password is disclosed in some form, e.g., shared by many people, MITM attacks are not far off.)
Redesigned dynamic ports might be released alongside encryption. Instructions will be carried by ProtoBuf, and the implementation will differ significantly from VMess dynamic ports.

wrapping existing encryption is very simple, just adding a layer of writer & reader. BETA 3 is expected to support SS's aes-128-gcm and chacha20-ietf-poly1305:
Client `encryption` can be filled with "auto: ss_aes-128-gcm_0_123456, ss_chacha20-ietf-poly1305_0_987654". "auto" will choose the best fit for the current machine, 0 represents beta version, and the last part is the password. Server `decryption` is filled similarly; it will attempt decryption one by one upon receiving a request.

Not all combinations need to be tried one by one: VMess encryption is divided into three parts. The first part is authentication info, combining UUID, alterId, and time factors. The second part is the command part, encrypted with a fixed algorithm; the command contains the encryption algorithm used for the data part. The third part is the important data part. It can be seen that VMess encryption/decryption is actually many-to-one (server adaptation), not just combining UUID. But encrypting just by combining UUID is relatively troublesome and won't be released soon. Given we have VMessAEAD now, there's no rush. If VLESS introduces encryption combined with UUID, it's equivalent to refactoring the entire VMess.

## UDP issues

[XUDP: VLESS & VMess & Mux UDP FullCone NAT](https://github.com/XTLS/Xray-core/discussions/252)

## Client Development Guidelines

1. The VLESS protocol itself will have incompatible upgrades, but client configuration file parameters will basically only increase, not decrease. iOS client protocol implementation needs to follow upgrades closely.
2. **Visual Standard: Please use VLESS uniformly for UI identifiers**, not VLess / Vless / vless. Configuration files are unaffected, code style follows natural conventions.
3. `encryption` should be an input box, not a select box. The default value for new configurations should be `none`. If the user leaves it empty, fill `none` automatically.

## VLESS Sharing Link Standard

Thanks to <img src="https://avatars2.githubusercontent.com/u/7822648?s=32" width="32px" height="32px" alt="a"/> [@DuckSoft](https://github.com/DuckSoft) for the proposal!

For details, please see [VMessAEAD / VLESS Sharing Link Standard Proposal](https://github.com/XTLS/Xray-core/issues/91)
