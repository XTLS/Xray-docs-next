# VLESS Protocol

VLESS is a stateless lightweight transmission protocol that can be used as a bridge between Xray clients and servers.

## Request & Response

| 1 byte           | 16 bytes        | 1 byte                          | M bytes                         | 1 byte      | 2 bytes | 1 byte       | S bytes | X bytes      |
| ---------------- | --------------- | ------------------------------- | ------------------------------- | ----------- | ------- | ------------ | ------- | ------------ |
| Protocol Version | Equivalent UUID | Additional Information Length M | Additional Information ProtoBuf | Instruction | Port    | Address Type | Address | Request Data |

| 1 Byte                                        | 1 Byte                             | N Bytes                            | Y Bytes       |
| --------------------------------------------- | ---------------------------------- | ---------------------------------- | ------------- |
| Protocol Version, consistent with the request | Length of additional information N | Additional information in ProtoBuf | Response data |

VLESS had the aforementioned structure as early as the second alpha test version (ALPHA 2), with BETA being the fifth test version.

"`Response authentication`" has been replaced with "`Protocol version`" and moved to the front, allowing VLESS to upgrade and eliminate the overhead of generating pseudo-random numbers. The obfuscation-related structure has been replaced with "`Additional information`" (ProtoBuf) and moved forward, giving the protocol itself scalability, with minimal overhead ([gogo/protobuf](https://github.com/gogo/protobuf)). If there is no additional information, there is no relevant overhead.

I always thought that "response authentication" was not necessary, and ALPHA replaced crypto/rand with math/rand in order to improve the performance of random number generation, which is no longer needed.

The "Protocol Version" not only serves as "Response Authentication", but also gives VLESS the ability to upgrade the protocol structure seamlessly, bringing infinite possibilities. The "Protocol Version" is 0 in the test version and 1 in the official version. If there are any incompatible protocol structural changes in the future, the version should be upgraded.

The design of VLESS server is switch version, which supports all VLESS versions at the same time. If you need to upgrade the protocol version (which may not happen), it is recommended that the server support it one month in advance, and then change the client after one month. VMess requests also have protocol versions, but their authentication information is outside, and the instruction part is highly coupled and has fixed encryption, which makes the protocol version meaningless inside. The server does not judge it, and the response does not have a protocol version. Trojan's protocol structure does not have a protocol version.

The following is a UUID. I used to think that 16 bytes were a bit long and considered shortening it. However, I later saw that Trojan used 56 printable characters (56 bytes), which completely dispelled this idea. The server needs to verify the UUID every time, so performance is also very important: VLESS's Validator has undergone multiple refactoring/upgrades. Compared with VMess, it is very concise and consumes very few resources. It can support a large number of users at the same time, and its performance is also very strong. The verification speed is extremely fast (sync.Map). API dynamically adds and deletes users, making it more efficient and smooth.
https://github.com/XTLS/Xray-core/issues/158

Introducing ProtoBuf is an innovation, which will be explained in detail later. The structure from "instruction" to "address" is currently identical to VMess and also supports Mux.

Overall, ALPHA 2 to BETA mainly includes: structural evolution, cleaning and integration, performance improvement, and more completeness. All of these are incremental improvements, please refer to [VLESS Changes](https://github.com/rprx/v2ray-vless/releases) for details.

## ProtoBuf

It seems that only VLESS supports embedding ProtoBuf, which is a data exchange format that encodes information tightly into binary TLV (Tag Length Value) structures.

The reason is that I saw an article that said that SS has some drawbacks, such as the lack of a design error reporting mechanism, and the client cannot take further action based on different errors. (But I don't agree that all errors should be reported, otherwise it can't prevent active probing. In the next beta version, the server can return a custom string of information.) So I think a scalable structure is important, and in the future, it can also carry dynamic port instructions. Not only the response, but the request also needs a similar structure. I originally planned to design TLV by myself, but then I found that ProtoBuf is the structure, ready-made, and it is completely suitable for this purpose, and the support for various languages is also good.

Currently, "Additional Information" only has Scheduler and SchedulerV, which are substitutes for MessName and MessSeed. **When you don't need them, the "Additional Information Length" is 0, so there is no ProtoBuf serialization/deserialization overhead**. Actually, I prefer to call this process "concatenation" because that's all pb does in principle, and the related overhead is minimal. The concatenated bytes are very compact, similar to ALPHA's solution, and those who are interested can output and compare them separately.

To indicate different levels of support for additional information (Addons, which can be understood as plugins and can have many plugins in the future), the next beta version will add "Addon Version" before "Addon Length". 256-1 = 255 bytes is enough and reasonable (65535 is too much and there may be malicious padding), and only one-tenth of the existing space is used. In the future, there will not be so many addons at the same time, and most of the time there will be no addons at all. If it is not enough, you can upgrade to a newer version of VLESS.

To reduce logical judgment and other expenses, it is temporarily decided that Addons will not use a multi-level structure. A month ago, there was an idea of "variable protocol format". PB can shuffle the order, but it is not necessary because the design of modern encryption will not allow bystanders to see that the headers of the two transmissions are the same.

Below is an introduction to the concepts of Schedulers and Encryption, both of which are optional. One is designed to address issues related to traffic timing, while the other is designed to address cryptographic issues.

## Flow

### Flow Control (Formerly Traffic Scheduler)

The Flow Control command is carried by ProtoBuf and manages the data section.

I previously discovered that VMess's original "metadata obfuscation" feature didn't provide any meaningful changes in TLS but only decreased performance. Consequently, VLESS has abandoned this feature. Moreover, the term "obfuscation" is often misinterpreted as camouflage, so it has been discarded.

As for camouflage, if it can't be an exact match, wouldn't it be a noticeable characteristic? If it could be an exact match, why not use the intended target for camouflage directly? Initially, I used SSR but found it only provided superficial disguises, fooling operators. Thus, I stopped using it.

#### Purpose of Flow Control

Flow Control influences macro traffic temporal characteristics rather than micro characteristics addressed by encryption. Traffic temporal characteristics can be:

1. **Protocol-based**, e.g., Socks5 handshake when using Socks5 over TLS. Different traits on TLS are considered different protocols for monitors. Infinite schedulers equate to infinite protocols (reallocating data sent each time).
2. **Behavior-based**, e.g., loading files, their order, and size when accessing Google's homepage. Adding another encryption layer cannot effectively conceal this information.

Schedulers don't require wrapping like encryption since the header data's tiny amount is negligible compared to the remaining data.

BETA 2 is anticipated to introduce two basic schedulers: Zstd compression and dynamic data expansion. Advanced operations will control and distribute at a macro level, but for now, these remain under development.

## Encryption

Unlike VMess, which is highly coupled, VLESS allows the server and client to pre-agree on an encryption method, which is only encrypted with an outer layer. This is somewhat similar to using TLS, which does not affect any of the data carried, and can be understood as replacing TLS with pre-agreed encryption at the bottom. Compared with high coupling, this approach is more reasonable and flexible: if there is a security issue with one encryption method, it can be discarded and another one can be used directly, which is very convenient. The VLESS server also allows for different encryption methods to coexist.

Compared with VMess, VLESS replaces security with encryption and disableInsecureEncryption with decryption, which solves all the problems. Currently, encryption and decryption only accept "none" and cannot be left blank (even if there are connection security checks in the future), as detailed in the VLESS configuration document. Encryption does not need to be moved out one level, firstly because it cannot reuse a lot of code, and secondly because it will affect the control granularity, which will be understood by looking at future applications.

Encryption supports two types of forms. One type is completely independent and requires an additional password, suitable for private use. The other type combines with the existing UUID for encryption, which is suitable for public use.

(If the first type of encryption is used and the password is publicly available in some form, such as multiple people sharing it, then a man-in-the-middle attack is not far away.)

A redesigned dynamic port may be released simultaneously with encryption, and the command is carried by ProtoBuf. The specific implementation and the dynamic port of VMess will also have many differences.

It is very easy to cash out encrypted currency, which adds an extra layer of writer & reader. BETA 3 is expected to support SS's aes-128-gcm and chacha20-ietf-poly1305:

The encryption on the client-side can be filled with "auto: ss_aes-128-gcm_0_123456, ss_chacha20-ietf-poly1305_0_987654". Auto will choose the most suitable one for the current machine, 0 represents the beta version, and the last one is the password. The decryption on the server-side is also filled in a similar way, and each decryption attempt will be made when the request is received.

Not all combinations need to be tried one by one: VMess encryption is divided into three parts. The first part is the authentication information, which combines UUID, alterId, and time factors. The second part is the instruction part, which is encrypted using a fixed algorithm. The instruction contains the encryption algorithm used in the data part. The third part is the important data part. It can be seen that the VMess encryption and decryption method is actually many-to-one (adapted by the server), not just combining UUID. However, it is also a relatively difficult thing to encrypt only by combining UUID. It will not be available in a short time. Considering that we now have VMessAEAD available, there is no need to rush. If VLESS introduces an encryption method that combines UUID, it is equivalent to reconstructing the entire VMess.

## UDP issues

[XUDP: VLESS & VMess & Mux UDP FullCone NAT](https://github.com/XTLS/Xray-core/discussions/252)

## Client Development Guide

1. The VLESS protocol itself may have incompatible upgrades, but the parameters in the client configuration file are basically only increased and not decreased. The protocol implementation of the iOS client needs to keep up with the upgrade.
2. Visual standard: Please use VLESS as the UI identifier uniformly, instead of VLess / Vless / vless. The configuration file is not affected, and the code should follow naturally.
3. `Encryption` should be made into an input box instead of a selection box. The default value of the new configuration should be `none`, and if the user leaves it blank, it should be filled in with `none`.

## VLESS Sharing Link Standard

Thank you to [@DuckSoft](https://github.com/DuckSoft) for the proposal!

Please see [VMessAEAD/VLESS Sharing Link Standard Proposal](https://github.com/XTLS/Xray-core/issues/91) for more details.
