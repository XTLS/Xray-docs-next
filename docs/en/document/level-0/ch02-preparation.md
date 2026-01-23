# [Chapter 2] Raw Materials Preparation

This chapter is somewhat special because it involves monetary transactions. Based on the neutral stance of this project, no specific recommendations will be made. What I can do is tell you what you need to prepare.

## 2.1 Obtain a VPS

You need to obtain a healthy VPS whose IP is not blocked, and complete the following basic preparations in the management panel:

1. Install the **Debian 10 64bit** system in the VPS management panel.
2. Make a note of the VPS IP address (this article will use `"100.200.300.400"` to represent it).
   ::: tip
   This is a deliberately written illegal IP; please replace it with your real IP.
   :::
3. Make a note of the VPS SSH remote login port.
4. Make a note of the SSH remote login username and password.

Purchasing a VPS is a relatively complex matter. It is recommended to learn some relevant knowledge first and choose one that fits your financial ability and line quality needs. Additionally, you can choose to take advantage of free offers from major international tech giants (such as the permanent free or limited-time free tiers provided by Oracle and Google). In short, please act according to your means.

::: tip Note
Regarding the choice of Debian 10 as the operating system, let me add a few words here: No matter what you hear online, no matter which "guru" tells you that XXX version of Linux is better or XXX version of Linux is cooler, these Linux distro wars **have absolutely nothing to do with you right now**! Using Debian 10 is sufficient to allow your VPS server to run securely and stably while receiving enough optimization (such as cloud-specific kernels, timely BBR support, etc.). Once you are familiar with Linux, it won't be too late to look back and try other Linux distributions.
:::

## 2.2 Obtain a Desired Domain Name

You need to obtain a domain name and add an A record in the DNS settings pointing to your VPS IP address.

1. Please choose a reliable international domain registrar. Choose some common domain suffixes, but be careful **not** to use the `.cn` suffix.
2. In the DNS settings, add an **A record** pointing to your VPS IP address (The name of the A record can be anything; this article will use `"a-name"` to represent it. The full domain name will be represented as `"subdomain.yourdomain.com"` or `"a-name.yourdomain.com"`). The effect is shown in the figure below:

![Add A Record](./ch02-img01-a-name.png)

::: tip
This is **not** a real, usable URL; please replace it with your real URL.
:::

## 2.3 Software to Install on Your Local Computer

1. **SSH Remote Login Tool**
   - Windows: [PuTTY](https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html)
   - macOS/Linux: Terminal

2. **Remote File Copy Tool**
   - Windows: [WinSCP](https://winscp.net/eng/index.php)
   - macOS/Linux: Terminal

3. **Reliable Text Editor**
   - Windows/macOS/Linux: [VSCode](https://code.visualstudio.com)

## 2.4 Your Progress

If you have prepared all the raw materials above, you have obtained the key to opening the door to a new world. So what are you waiting for? Let's move on to the next chapter and walk through that door!

> ⬛⬛⬜⬜⬜⬜⬜⬜ 25%
