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

An Airport refers to a pre made solution, where a provider is responsible all technical aspects of hosting and providing the service as mentioned in section 1.4, with the user only paying for the right to use the service.

First of all, I would like to respond to critics by asking a question: Is using an airport really a cure all?

Secondly, I believe that there is a fundamental difference between "not understanding" and "not wanting to understand". The bad attitude of some people who just want handouts is naturally annoying, but those who sincerely want to learn but don't know how should not be subject to unjustified contempt and discrimination. It is precisely this kind of bad community atmosphere that does not distinguish between newcomers that prompted me to write this article. So without further ado, let's take a look at the advantages and disadvantages of using an airport:

- Advantages of "Airports"
1. **Stability**: Airports usually feature multiple exit nodes, hence resistance to attempts at blocking these node, if one get block simply switch to another
2. **Speed**: Airports typically make use of high capacity machines and high throughput network infrastructures, therefore you can expect a higher overall network speed
3. **Safety**: Airports are generally have good security practices, such as encryption and firewalls to ensure the security of user data
4. **reliability**: Airports employ a dedicated team to manage their services ensuring they remain online and reliable
5. **support**: you can generally expect an Airport to have a support team to answer your queries.
6. **Simplicity**: One-click rule addition, Scannable configurations, etc.
7. **diverse-exit-nodes**: Useful to access geo-restricted content or to get a lower ping for gaming

- Risks of "Airport"

"The counterpart of convenience in 'internet' security is 'risk', some  risk of 'airports' you can find on the market are"

1. service providers can obtain all infomation that passes through their servers, these data are very likely stored by the providers for a long time with little legal means to stop them
2. there is little governance on the market for "airports", meaning there are plenty cases of fraud where providers disappear after being paid
3. Service providers can face regulatory pressures, while large providers are relatively secure, they cannot avoid attention from the government, In 2020 there are many cases where several large airports experience major service disruptions
4. A providers technical prowess is difficult to determine, the quality of the service provided varies greatly, with false advertising being common

## 1.6 So should you host your own tunnel?

Now that you have seen the advantages and risks of using a service provider, please think carefully and make your own decision on what to use. After all, the best plan is the one that suits you best.

![It's Your Choice!](./ch01-img01-choice.png)

1. If you decide to use an existing service provider, you can close this article now.

2. If you decide to build it yourself, please continue reading the following chapters!

In short, the goal of this article is to serve as a starting point for users with zero experience, providing thorough explanations and demonstrations for each step, even if it may seem overly detailed or repetitive. The aim is to assist beginners in completing the entire process of deploying a VPS server from the first command input to successfully accessing the internet via the client, and gradually introducing them to basic Linux operations, laying a foundation for further self-learning.

## 1.7 Some digressions

1. There is a wealth of information beyond the wall, so please learn to think rationally and independently. Don't take sides easily and don't believe in sensational information. (This also serves as an reminder for friends live beyond the wall)

2. We sincerely hope that with a more open internet, everyone can access knowledge in real time, find better entertainment, experience this amazing world, and find like-minded individual to befriend, but do not become a scapegoat for anyone with ulterior motives.

3. Your internet identity is still your identity, and achieving absolute anonymity is extremely difficult. Therefore, please be sure to comply with the relevant laws and regulations in your personal location and the location of your IP address. Self-preservation should be your highest priority. (TLDR. Please take responsibility for your action on the internet)

## 1.8 Your Progress

> ⬛⬜⬜⬜⬜⬜⬜⬜ 12.5%
