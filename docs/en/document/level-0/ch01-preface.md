# [Chapter 1] Simple and Plain Language

## 1.1 Who is this document written for?

One sentence: Written for newbies who are **(1) absolute beginners** and **(2) interested in learning how to build their own VPS**.

## 1.2 Who is this document not written for?

Including but not limited to: experts and professionals, beginners who are too lazy to tinker on their own, advanced users who already know how to tinker, wealthy users who insist on using airport services, and those who prefer using one-click scripts. In short, if you have a technical background or don't want to build it yourself, you can close this article directly, because this article may not be suitable for you and may even make you upset.

## 1.3 Declaration and Other Statements

Declaration:

My technical skills are extremely limited, so this article is inevitably full of errors and flaws. If you find any problems, please kindly point them out and don't be too harsh on me.

Disclaimer:

Please judge the reliability and usability of the content of this article by yourself. If you encounter any problems or negative results when establishing and using a VPS server based on the content of this article, I am not responsible for it.

Verbose statement:

Considering the target audience of this article, which is "users with zero experience", many details will be explained in great detail, so the language may be verbose. Please be mentally prepared for this.

## 1.4 Why is self-hosting a challenge?

To answer this question, we need to provide a little more background information.

1. On the matter of accessing the internet through scientific means

The act of accessing the internet using scientific methods has been around for almost 20 years (shocking!!!.jpg). Initially, one could do it with a little effort (changing the host file, using SSH), then one had to find a web proxy, and later, one had to develop a private protocol (such as Shadowsocks) and so on.

With the continuous iteration and upgrade of GFW technology over the past decade, to achieve the goal of [building your own scientific Internet access], the things that need to be done include but are not limited to:

- Understand basic Linux commands
- Understand network transmission protocols
- Have the technical and financial ability to purchase and manage a VPS
- Have the technical and financial ability to purchase and manage a domain name
- Have the technical ability to apply for a TLS certificate, and so on.

This has turned the once simple act of [setting up a self-built VPS for accessing the internet in a secure and unrestricted manner] into a daunting challenge that intimidates newcomers.

2. Helplessness of Zero-based Users

For non-technical users with zero foundation, if they complete the above series of operations, they will inevitably need to learn a lot of knowledge. However, after a little searching, newbies are likely to become even more confused: a large amount of information is scattered in various corners of the Internet: blogs, Q&A sites, groups, forums, GitHub, Telegram, YouTube, and so on. These pieces of information are chaotic and complex, with varying levels of quality, and may even contradict each other. Basically, they won't stop until they completely confuse the newcomer.

Faced with such chaotic information, newcomers suddenly shift from [information scarcity] to [information overload]. If they fail after several attempts of groping and guessing (which is highly probable), their enthusiasm is bound to be greatly frustrated. In this process, if they happen to seek help in some unfriendly places, they may be ridiculed even more: "You're so inexperienced, just use the airport, why bother messing around!" "Go learn Linux first before coming back to ask."

At this moment, probably only an "hehe" can express the mood.

## 1.5 "Why not just use the airport?"

First of all, I would like to respond to those who ridicule and criticize by asking a question: Is using the airport really a panacea?

Secondly, I believe that there is a fundamental difference between "not understanding" and "not wanting to understand". The bad attitude of some people who just want handouts is naturally annoying, but those who sincerely want to learn but don't know how should not be subject to unjustified contempt and discrimination. It is precisely this kind of bad community atmosphere that does not distinguish between newcomers that prompted me to write this article. So without further ado, let's take a look at the advantages and disadvantages of the airport:

1. 稳定性高：机场节点数量多，分布广泛，避免了单点故障的风险，保证了整个网络的稳定性。
2. 速度快：机场的节点通常采用高速服务器和优化的网络架构，网络速度较快，能够满足用户的高速上网需求。
3. 安全性高：机场通常会采用严格的安全措施，如流量加密、防火墙等，保护用户数据的安全性。
4. 稳定性高：机场通常采用专业的运维团队进行管理和维护，保证了服务的稳定性和可靠性。
5. 服务质量高：机场通常会提供完善的客户服务，及时解决用户的问题和反馈，提升用户的满意度。

The so-called "airport" refers to the "line provider". They are responsible for completing the technical operations and management mentioned in section 1.4, while users pay for the right to use the service. Therefore, its advantages include at least:

1. **Simple User Operation**: Scan code operation, one-click rule addition, etc.
2. **Multiple Line Options**: Can unlock network services in different countries and regions, such as iplc dedicated line services, game acceleration services, etc.
3. **Multiple Access Nodes**: Therefore, it has a stronger ability to resist node blocking, if one is blocked, just switch to another one.

2. Risks of "Airport"

"The other side of the coin of 'convenience' is 'risk'. Based on the technical characteristics and market conditions of the 'airport', its risks include at least:"

1. "Airport" can fully obtain user information: All the traces left by users online will inevitably and very likely be stored on their servers for a long time. These records cannot be restricted by any legally binding user privacy agreement. ("Snooping and recording your every move")
2. "Airport" lacks market management: There are inevitably malicious merchants who target fraud. ("Actively run away")
3. "Airport" faces regulatory pressure: While large airports are relatively secure, they cannot avoid attracting attention. In 2020, several large airports experienced shutdowns and runaways, seriously disrupting users' normal usage. ("Passively run away")
4. "Airport" technical level is difficult to determine: The quality of the line varies greatly, and the phenomenon of falsely advertising quality services is common. ("Slow speed, frequent disconnections, unable to connect")

## 1.6 So should you build your own website?

Now that you have seen the advantages and risks of the airport, please think carefully and make your own decision on what to use. After all, the best plan is the one that suits you best.

![It's Your Choice!](./ch01-img01-choice.png)

1. If you decide to use the airport, you can close this article now.

2. If you decide to build it yourself, please continue reading the following chapters!

In short, the goal of this article is to serve as a starting point for users with zero experience, providing thorough explanations and demonstrations for each step, even if it may seem overly detailed or repetitive. The aim is to assist beginners in completing the entire process of deploying a VPS server from the first command input to successfully accessing the internet via the client, and gradually introducing them to basic Linux operations, laying a foundation for further self-learning.

## 1.7 Some digressions

1. There is a wealth of information outside of the wall, so please learn to think rationally and independently. Don't take sides easily and don't believe in sensational information.

2. We sincerely hope that with a smoother internet, everyone can access fresher knowledge, richer entertainment, experience a better world, and make more like-minded friends, but do not become a scapegoat for anyone with ulterior motives.

3. Your internet identity is still your identity, and achieving absolute anonymity is extremely difficult. Therefore, please be sure to comply with the relevant laws and regulations in your personal location and the location of your IP address. Self-protection is always the most basic bottom line.

## 1.8 Your Progress

> ⬛⬜⬜⬜⬜⬜⬜⬜ 12.5%