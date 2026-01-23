# [Chapter 1] Plain English Guide for Absolute Beginners

## 1.1 Who is this document for?

In short: It is written for newcomers who have **① Zero technical background** and **② A desire to learn how to self-host a VPS**.

## 1.2 Who is this document NOT for?

Including but not limited to: various tech gurus, beginners too lazy to tinker, experts who already know the ropes, big spenders determined to use "Airports" (VPN service providers), and the "Carefree Sect" determined to use one-click scripts... In short, as long as you have a technical foundation or are unwilling/don't want to build it yourself, you can close this article right now. This article probably won't meet your high standards and might just make you angry over nothing, which isn't worth it.

## 1.3 Solemn Declaration and Other Declarations

**Solemn Declaration:**

My technical skills are incredibly poor, so this text will inevitably have omissions and be full of flaws. If you find issues, please remind me gently; do not engage in personal attacks.

**Disclaimer:**

Please judge the credibility, reliability, and usability of this content yourself. I am not responsible for any issues or adverse results arising from building and using a VPS server based on this content.

**Verbose Declaration:**

Based on the target audience of this article (Zero-basis users), many contents will be explained as exhaustively as possible. Therefore, the language will lean towards being wordy/long-winded. Please be mentally prepared.

## 1.4 Why is self-hosting a difficult problem?

To answer this question, we need to provide a bit more background information.

**I. The matter of Scientific Internet Access (Circumvention)**

The practice of "Scientific Internet Access" (circumventing the firewall) has been developing for nearly twenty years (Shocking!!!.jpg). Initially, you only needed to move your hands a little (tweak the hosts file, connect via SSH). Later, you needed to find a web proxy, and then later you needed to write a private protocol (like Shadowsocks), and so on.

With the GFW technology constantly iterating and upgrading over the last decade, the tasks required to achieve the goal of "Do-It-Yourself Circumvention" now include but are not limited to:

- Understanding basic Linux system commands
- Understanding network transmission protocols
- Having the technical and financial capability to complete VPS purchase and management
- Having the technical and financial capability to complete Domain purchase and management
- Having the technical capability to complete TLS certificate application, etc.

This has turned the once-simple act of "self-hosted VPS circumvention" into a daunting challenge for newcomers.

**II. The helplessness of zero-basis users**

If a zero-basis, non-technical user wants to complete the series of operations above, they inevitably have to learn a vast amount of knowledge. However, after a little searching, the newcomer will likely become even more lost: massive amounts of information are scattered across every corner of the Internet (blogs, Q&A sites, groups, forums, GitHub, Telegram, YouTube, etc.). This information is chaotic, complex, of varying quality, and potentially contradictory. Basically, it won't stop until the newcomer is completely dizzy.

Faced with this disorganized information, the newcomer suddenly goes from "information scarcity" to "information overload." If they try to muddle through a few times and end up failing (which is highly probable), their enthusiasm will inevitably suffer a major setback. During this process, if they happen to go to some unfriendly places to ask for help, they might be ridiculed, adding insult to injury: "If you're so bad at this, just use an Airport, why are you blindly tinkering?", "Go learn Linux first before coming back to ask."

At this point, perhaps only a sarcastic "Heh" can express one's mood.

## 1.5 "Isn't using an airport enough?"

First, I want to ask those who sneer: Is "using an airport" really a panacea?

Secondly, I believe there is a fundamental difference between "not understanding" and "not wanting to understand." While entitled "giant babies" with bad attitudes are naturally annoying, people who genuinely want to self-study but can't find the way shouldn't be subjected to unwarranted eye-rolls and discrimination. It is precisely this toxic community atmosphere that makes no distinction regarding newcomers that prompted me to write this article. So, without further ado, let's look at the pros and cons of airports:

**I. Advantages of "Airports"**

A so-called "Airport" is a "Line Provider" (VPN/Proxy Service). They handle the string of technical operations and management mentioned in 1.4, and the user pays for the right to use it. Therefore, its advantages are at least:

1. **Simple User Operation**: Scanning QR codes, one-click rule addition, etc.
2. **Many Line Choices**: Can unlock network services in different countries and regions; such as IPLC dedicated lines, game acceleration services, etc.
3. **Many Access Nodes**: Stronger ability to resist node blocking; if one gets blocked, just switch to the next.

**II. Risks of "Airports"**

The other side of the "convenience" coin is "risk." Based on the technical characteristics and market situation of "Airports," the risks are at least:

1. **"Airports" can fully access user information**: All user traces on the Internet *inevitably* pass through and are *very likely* stored on their servers for a long time. These records are not bound by any legally effective user privacy agreements (**peeping, recording your every move**).
2. **"Airports" lack market regulation**: There are inevitably malicious merchants aiming at fraud (**active exit scams/running away**).
3. **"Airports" face regulatory pressure**: While big airports are relatively secure, they cannot avoid attracting attention. In 2020, several large airports suspended operations or ran away, severely interfering with users' normal usage (**passive exit scams/forced shutdown**).
4. **"Airport" technical levels are hard to determine**: Line quality varies greatly, and deceptive practices are common (**slow speeds, frequent drops, inability to connect**).

## 1.6 So, do you want to self-host or not?

Now that you have seen the advantages and risks of airports, please think fully and decide for yourself what to use. After all, the solution that suits you best is the best solution.

![It's Your Choice!](./ch01-img01-choice.png)

1. If you decide to use an airport, you can close this article now.

2. If you decide to self-host, please continue reading the following chapters!!

In short, the goal of this article is to become the knowledge starting point for zero-basis users. It provides full explanations and demonstrations for every step, clearly (even **naggingly, chattily, and wordily**) assisting newcomers to complete the entire process from **inputting the first command, deploying the VPS server, to successfully circumventing the firewall on the client side**. In this process, it helps newcomers gradually contact and become familiar with basic Linux operations, laying a foundation for further self-study.

## 1.7 A few extra words

1. Information outside the wall is mixed. Please be sure to learn rational, independent critical thinking. Do not blindly take sides, and do not readily trust sensational information.

2. I sincerely hope that after obtaining a smoother network, you can acquire fresh knowledge, richer entertainment, contact a better world, and make more like-minded friends, but do not become a scapegoat for anyone with ulterior motives.

3. Your internet identity is still your identity. Absolute anonymity is extremely difficult, so please be sure to comply with the relevant laws and regulations of your personal location and your IP location. At all times, self-protection is the most basic bottom line.

## 1.8 Your Progress

> ⬛⬜⬜⬜⬜⬜⬜⬜ 12.5%
