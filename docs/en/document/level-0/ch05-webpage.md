# [Chapter 5] Website Setup

## 5.1 Why create a website?

Newcomers might be confused: why do I need to build a website just to access the "scientific internet" (circumvent the firewall)? I don't know programming; isn't it very troublesome?

Let's answer the first question. Reasons for building a website:

1. To apply for a legitimate TLS certificate (Very important).
2. To provide a reasonable fallback mechanism to prevent active probing attacks and improve security.
3. To build a camouflage site (such as a blog, private cloud drive, multimedia site, game site, etc.) so that there is a legitimate front-end when accessed directly, making traffic usage look more reasonable.

Now for the second question:

1. This article, as a demonstration, uses only a very simple [single-file HTML page + Nginx] to achieve the above goals, so it is **very simple**.
2. This website can be more than just camouflage; you can actually make it big and strong. The complexity depends entirely on you.
3. For the goals of "camouflage" and "website operation," what is needed is individuality and showing your true self. Interested students can search and learn on their own. This content has completely deviated from "scientific internet access," so this article will not delve into it.

## 5.2 Login to VPS, Install and Run Nginx

1. The commands used here have been explained in detail previously, so they won't be repeated. Students who don't understand can review the previous chapters.

   ```shell
   sudo apt update && sudo apt install nginx
   ```

2. After completion, Nginx runs automatically. Now open a browser on Windows and enter `http://100.200.300.400:80`. If you see the interface below, Nginx is running normally.

   ![Nginx Default Page](./ch05-img01-nginx-default-running.png)

3. If you cannot see the Nginx default page mentioned above, you may need to configure the default firewall component, Uncomplicated Firewall (UFW), on the Debian system to enable HTTP (80) and HTTPS (443) port traffic.

   a. Verification method, input:

   ```shell
   sudo ufw status
   ```

   b. If the output is as follows, indicating ports 80 and 443 are not enabled, proceed to step c.

   ```shell
   Status: active
   To                         Action      From
   --                         ------      ----
   22/tcp                     ALLOW       Anywhere
   22/tcp (v6)                ALLOW       Anywhere (v6)
   ```

   c. Command to enable Nginx ports 80 and 443 in UFW:

   ```shell
   sudo ufw allow 'Nginx Full'
   ```

   d. Enter the command from step a again to verify. If the output is as follows, it means Nginx traffic has been allowed by the firewall, and you should be able to see the Nginx default page mentioned in point 2.

   ```shell
   Status: active
   To                         Action      From
   --                         ------      ----
   22/tcp                     ALLOW       Anywhere
   Nginx Full                 ALLOW       Anywhere
   22/tcp (v6)                ALLOW       Anywhere (v6)
   Nginx Full (v6)            ALLOW       Anywhere (v6)
   ```

## 5.3 Create a Very Simple Web Page

1. **Basic Linux Commands for Beginners:**

   |   Code   |    Command Name    |      Description       |
   | :------: | :----------------: | :--------------------: |
   | `cmd-10` |      `mkdir`       | Create a new directory |
   | `cmd-11` | `systemctl reload` |    Reload a service    |

2. **Basic Linux Configuration Files for Beginners:**

   |   Code    |      File Location      |      Description       |
   | :-------: | :---------------------: | :--------------------: |
   | `conf-02` | `/etc/nginx/nginx.conf` | Nginx program settings |

3. Create a dedicated folder for the website `/home/vpsadmin/www/webpage/` and create the webpage file `index.html`.

   ```shell
   mkdir -p ~/www/webpage/ && nano ~/www/webpage/index.html
   ```

   ::: warning
   If you are not using the username `vpsadmin`, please understand the meaning of the `“~”` symbol in this command (this relates to the content you will write in [Step 5]):
   - If you are a [non-root user], `“~”` is equivalent to `/home/username`.
   - If you are the [root user], `“~”` is equivalent to `/root`.
     :::

4. Copy the content below completely into the file, then save (`ctrl+o`) and exit (`ctrl+x`).

   ```html
   <html lang="">
     <head>
       <title>Enter a title, displayed at the top of the window.</title>
     </head>
     <body>
       <h1>Enter the main heading, usually the same as the title.</h1>
       <p>
         Be <b>bold</b> in stating your key points. Put them in a list:
       </p>
       <ul>
         <li>The first item in your list</li>
         <li>The second item; <i>italicize</i> key words</li>
       </ul>
       <p>Improve your image by including an image.</p>
       <p>
         <img
           src="[https://i.imgur.com/SEBww.jpg](https://i.imgur.com/SEBww.jpg)"
           alt="A Great HTML Resource"
         />
       </p>
       <p>
         Add a link to your favorite
         <a href="[https://www.dummies.com/](https://www.dummies.com/)"
           >Web site</a
         >. Break up your page with a horizontal rule or two.
       </p>
       <hr />
       <p>
         Finally, link to <a href="page2.html">another page</a> in your own
         Web site.
       </p>
       <p>&#169; Wiley Publishing, 2011</p>
     </body>
   </html>
   ```

   Grant read permissions to other users for this file:

   ```shell
   chmod -R a+r .
   ```

5. Modify `nginx.conf` and restart the `Nginx` service to point http access on port `80` to the `html` page just created.
   1. Modify `nginx.conf`.

      ```shell
      sudo nano /etc/nginx/nginx.conf
      ```

   2. Add the following segment inside `http{}`, then save (`ctrl+o`) and exit (`ctrl+x`). (Remember to replace the domain name with the real domain name including the subdomain you prepared earlier).

      ```nginx
            server {
                    listen 80;
                    server_name subdomain.yourdomain.com;
                    root /home/vpsadmin/www/webpage;
                    index index.html;
            }
      ```

      ::: warning Special Note!
      As mentioned in my hint in [Step 3], please make sure `/home/vpsadmin/www/webpage` is changed to your actual file path.
      :::

   3. Reload the `nginx` configuration to make it effective.

      ```shell
      sudo systemctl reload nginx
      ```

   4. The complete setup process is shown below:

      ![Webpage Setup Demo](./ch05-img02-nginx-conf-full.gif)

   5. Now, if you visit `http://subdomain.yourdomain.com` and see a page like this, it means success:

      ![HTTP Webpage Success](./ch05-img03-nginx-http-running.png)

## 5.4 Explanation of Common Errors

First, if you followed the instructions in the article step by step and were careful enough, you definitely wouldn't encounter errors. Therefore, I do not intend to modify how this article is written.

So why do many students still get stuck at this step and can't open the webpage? Basically, it comes down to one word: **carelessness**. There are only two potential configuration problems here, and only two causes.

**I. Two Problems:**

- The path `/home/vpsadmin/www/webpage` in `nginx.conf` does not match your actual file path, so `nginx` cannot find the file.
- The path is correct, but `nginx` does not have permission to read it.

**II. Two Causes:**

- Using a [non-root user] but still copying the commands from the article directly without modification. (This is basically like copying a classmate's name along with their answers during a test).
- Insisting on using the [root user].

Students encountering errors should look back carefully at the instructions in [Step 3] and [Step 5-2] of section [5.3].

::: warning
Earlier in this article, a significant amount of space was dedicated to explaining the importance of using a [non-root user] for security, and the entire text is written based on this premise. Therefore, problems caused by using the [root user] are not within the scope of this article's design.

However, I believe that students who insist on using the [root user] likely have their own opinions, strong hands-on abilities, or a certain Linux foundation. I have explained the crux of the problem, and I trust you can solve it on your own.
:::

## 5.5 Your Progress

At this point, Xray's first infrastructure component, the [Website], is in place. We will immediately move on to the second infrastructure component: [Certificates]!

> ⬛⬛⬛⬛⬛⬜⬜⬜ 62.5%
