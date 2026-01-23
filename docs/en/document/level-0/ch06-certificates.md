# [Chapter 6] Certificate Management

## 6.1 Applying for a TLS Certificate

Next, we need to apply for a real TLS certificate for our domain name. This enables standard TLS encryption and HTTPS access for the website. This is the most crucial tool for modern secure proxy tools like Xray to ensure traffic is fully encrypted.

::: warning
Please do not use self-signed certificates lightly. They don't make the operation much simpler, but they add senseless risks (such as Man-in-the-Middle attacks).
:::

Here, I will use a certificate management tool called [`acme.sh`](https://github.com/acmesh-official/acme.sh). It is simple, lightweight, efficient, and handles automatic certificate renewals.

Additionally, I trust that by now you are gradually becoming familiar with basic Linux operations. Therefore, starting from this chapter, commands that have appeared multiple times will no longer be accompanied by screenshots, but only simple descriptions. If you really can't remember how to use them, please review the previous chapters.

## 6.2 Installing `acme.sh`

1. Basic Linux Commands for Beginners:

    | ID | Command | Description |
    |:--:|:--:|:--:|
    | `cmd-12` | `wget` | Visit (or download) a web file |
    | `cmd-13` | `acme.sh` | Commands related to acme.sh certificate management |

2. Run the installation script

    ```shell
    wget -O -  [https://get.acme.sh](https://get.acme.sh) | sh
    ```

3. Make the `acme.sh` command effective

    ```shell
    . .bashrc
    ```

4. Enable auto-upgrade for `acme.sh`

    ```shell
    acme.sh --upgrade --auto-upgrade
    ```

5. The complete process up to this step is shown below:

    ![acme.sh installation demo](./ch06-img01-acme-install.gif)

## 6.3 Testing Certificate Issuance

Before officially applying for a certificate, let's use a test command (`--issue --server letsencrypt_test`) to verify if the application can be successful. This avoids repeated failures due to local configuration errors, which could exceed Let's Encrypt's frequency limits (e.g., maximum of 5 failures per hour, per domain, per user), blocking subsequent steps.

1. The command to test certificate issuance is as follows (This article uses `ECC` certificates as an example, because nowadays, there is really no reason not to use them):

    ```shell
    acme.sh --issue --server letsencrypt_test -d subdomain.yourdomain.com -w /home/vpsadmin/www/webpage --keylength ec-256
    ```

    ::: warning Note
    The main advantage of `ECC` certificates lies in their smaller Key size, which means improved security and faster encryption/decryption speeds for the same size. For instance, the strength of ECC-256bit is roughly equivalent to RSA-3072bit, so why not? Of course, some say ECC certificate handshakes are noticeably faster; I think that's a bit of an exaggeration. RSA handshakes aren't that slow, and even if there is a difference, it should be in milliseconds, which is hard to perceive directly.

    However, if some websites specifically need to be compatible with very ancient devices, please choose `RSA` certificates as needed.
    :::

2. You should ultimately see a log similar to this:

    ```log
    [Wed 30 Dec 2022 04:25:12 AM EST] Using ACME_DIRECTORY: [https://acme-staging-v02.api.letsencrypt.org/directory](https://acme-staging-v02.api.letsencrypt.org/directory)
    [Wed 30 Dec 2022 04:25:13 AM EST] Using CA: [https://acme-staging-v02.api.letsencrypt.org/directory](https://acme-staging-v02.api.letsencrypt.org/directory)
    [Wed 30 Dec 2022 04:25:13 AM EST] Create account key ok.
    [Wed 30 Dec 2022 04:25:13 AM EST] Registering account: [https://acme-staging-v02.api.letsencrypt.org/directory](https://acme-staging-v02.api.letsencrypt.org/directory)
    [Wed 30 Dec 2022 04:25:13 AM EST] Registered
    [Wed 30 Dec 2022 04:25:13 AM EST] ACCOUNT_THUMBPRINT='CU6qmPKuRqhyTAIrF4swosR375194z_1ddUlWef8xDc'
    [Wed 30 Dec 2022 04:25:13 AM EST] Creating domain key
    [Wed 30 Dec 2022 04:25:13 AM EST] The domain key is here: /home/vpsadmin/.acme.sh/subdomain.yourdomain.com_ecc/subdomain.yourdomain.com.key
    [Wed 30 Dec 2022 04:25:13 AM EST] Single domain='subdomain.yourdomain.com'
    [Wed 30 Dec 2022 04:25:13 AM EST] Getting domain auth token for each domain
    [Wed 30 Dec 2022 04:25:14 AM EST] Getting webroot for domain='subdomain.yourdomain.com'
    [Wed 30 Dec 2022 04:25:14 AM EST] Verifying: subdomain.yourdomain.com
    [Wed 30 Dec 2022 04:25:23 AM EST] Pending
    [Wed 30 Dec 2022 04:25:25 AM EST] Success
    [Wed 30 Dec 2022 04:25:25 AM EST] Verify finished, start to sign.
    [Wed 30 Dec 2022 04:25:25 AM EST] Lets finalize the order.
    [Wed 30 Dec 2022 04:25:25 AM EST] Le_OrderFinalize='[https://acme-staging-v02.api.letsencrypt.org/acme/finalize/490205995/7730242871](https://acme-staging-v02.api.letsencrypt.org/acme/finalize/490205995/7730242871)'
    [Wed 30 Dec 2022 04:25:25 AM EST] Downloading cert.
    [Wed 30 Dec 2022 04:25:25 AM EST] Le_LinkCert='[https://acme-staging-v02.api.letsencrypt.org/acme/cert/xujss5xt8i38waubafz2xujss5xt8i38waubz2](https://acme-staging-v02.api.letsencrypt.org/acme/cert/xujss5xt8i38waubafz2xujss5xt8i38waubz2)'
    [Wed 30 Dec 2022 15:21:52 AM EST] Cert success.
    --BEGIN CERTIFICAT--
    sxlYqPvWreKgD5b8JyOQX0Yg2MLoRUoDyqVkd31PthIiwzdckoh5eD3JU7ysYBtN
    cTFK4LGOfjqi8Ks87EVJdK9IaSAu7ZC6h5to0eqpJ5PLhaM3e6yJBbHmYA8w1Smp
    wAb3tdoHZ9ttUIm9CrSzvDBt6BBT6GqYdDamMyCYBLooMyDEM4CUFsOzCRrEqqvC
    ... (omitted for brevity) ...
    yiLKcBFc5H7dgJCImo7us7aJeftC44uWkPIjw9AKH=
    --END CERTIFICAT--
    [Wed 30 Dec 2022 15:21:52 AM EST] Your cert is in  /home/vpsadmin/.acme.sh/subdomain.yourdomain.com_ecc/subdomain.yourdomain.com.cer
    [Wed 30 Dec 2022 15:21:52 AM EST] Your cert key is in  /home/vpsadmin/.acme.sh/subdomain.yourdomain.com_ecc/subdomain.yourdomain.com.key
    [Wed 30 Dec 2022 15:21:52 AM EST] The intermediate CA cert is in  /home/vpsadmin/.acme.sh/subdomain.yourdomain.com_ecc/ca.cer
    [Wed 30 Dec 2022 15:21:52 AM EST] And the full chain certs is there:  /home/vpsadmin/.acme.sh/subdomain.yourdomain.com_ecc/fullchain.cer
    ```

3. Note: What we applied for here is a test certificate. It cannot be used directly; it merely proves that your domain and configuration are all correct. Look closely, and you will find that the issuer domain is `https://acme-staging-v02.api.letsencrypt.org`. You can understand this `staging` as the "Test Server"!

4. If an error occurs in this step, you can run the following command to view the detailed application process and specific errors. (If you don't understand it, hide sensitive information and ask in the Xray community group).

    ```shell
    acme.sh --issue --server letsencrypt_test -d subdomain.yourdomain.com -w /home/vpsadmin/www/webpage --keylength ec-256 --debug
    ```

    Yes, that's right, just add a `--debug` parameter at the end of the command.

5. After confirming this step is successful, you can apply for the official certificate. (You don't need to delete the test certificate; it will be automatically overwritten by the official certificate).

## 6.4 Official Certificate Issuance

1. The command to apply for the official certificate is as follows (change the `--server letsencrypt_test` parameter to `--server letsencrypt`, and add the `--force` parameter at the end):

    ```shell
    acme.sh --set-default-ca --server letsencrypt
    ```

    ```shell
    acme.sh --issue -d subdomain.yourdomain.com -w /home/vpsadmin/www/webpage --keylength ec-256 --force
    ```

    ::: warning Note
    The `--force` parameter means to manually (forcefully) update the certificate before the existing certificate expires. Although the certificate we applied for from the "Test Server" in the previous step cannot be used directly, it has not yet expired, so this parameter is needed.
    :::

2. You should ultimately see a log very similar to the one above:

    ```log
    vpsadmin@vps-server:~$ acme.sh --issue -d subdomain.yourdomain.com -w /home/vpsadmin/www/webpage --keylength ec-256
    [Wed 30 Dec 2022 15:22:51 AM EST] Using CA: [https://acme-v02.api.letsencrypt.org/directory](https://acme-v02.api.letsencrypt.org/directory)
    [Wed 30 Dec 2022 15:22:51 AM EST] Creating domain key
    [Wed 30 Dec 2022 15:22:51 AM EST] The domain key is here: /home/vpsadmin/.acme.sh/subdomain.yourdomain.com_ecc/subdomain.yourdomain.com.key
    [Wed 30 Dec 2022 15:22:51 AM EST] Single domain='subdomain.yourdomain.com'
    [Wed 30 Dec 2022 15:22:51 AM EST] Getting domain auth token for each domain
    [Wed 30 Dec 2022 15:22:51 AM EST] Getting webroot for domain='subdomain.yourdomain.com'
    [Wed 30 Dec 2022 15:22:51 AM EST] Verifying: subdomain.yourdomain.com
    [Wed 30 Dec 2022 15:22:51 AM EST] Pending
    [Wed 30 Dec 2022 15:22:51 AM EST] Success
    [Wed 30 Dec 2022 15:22:51 AM EST] Verify finished, start to sign.
    [Wed 30 Dec 2022 15:22:51 AM EST] Lets finalize the order.
    [Wed 30 Dec 2022 15:22:51 AM EST] Le_OrderFinalize='[https://acme-v02.api.letsencrypt.org/acme/finalize/490205996/7730242872](https://acme-v02.api.letsencrypt.org/acme/finalize/490205996/7730242872)'
    [Wed 30 Dec 2022 15:22:51 AM EST] Downloading cert.
    [Wed 30 Dec 2022 15:22:51 AM EST] Le_LinkCert='[https://acme-v02.api.letsencrypt.org/acme/cert/vsxvk0oldnuobe51ayxz4dms62sk2dwmw9zhuw](https://acme-v02.api.letsencrypt.org/acme/cert/vsxvk0oldnuobe51ayxz4dms62sk2dwmw9zhuw)'
    [Wed 30 Dec 2022 15:22:51 AM EST] Cert success.
    --BEGIN CERTIFICAT--
    sxlYqPvWreKgD5b8JyOQX0Yg2MLoRUoDyqVkd31PthIiwzdckoh5eD3JU7ysYBtN
    cTFK4LGOfjqi8Ks87EVJdK9IaSAu7ZC6h5to0eqpJ5PLhaM3e6yJBbHmYA8w1Smp
    ... (omitted for brevity) ...
    yiLKcBFc5H7dgJCImo7us7aJeftC44uWkPM=
    --END CERTIFICAT--
    [Wed 30 Dec 2022 15:22:52 AM EST] Your cert is in  /home/vpsadmin/.acme.sh/subdomain.yourdomain.com_ecc/subdomain.yourdomain.com.cer
    [Wed 30 Dec 2022 15:22:52 AM EST] Your cert key is in  /home/vpsadmin/.acme.sh/subdomain.yourdomain.com_ecc/subdomain.yourdomain.com.key
    [Wed 30 Dec 2022 15:22:52 AM EST] The intermediate CA cert is in  /home/vpsadmin/.acme.sh/subdomain.yourdomain.com_ecc/ca.cer
    [Wed 30 Dec 2022 15:22:52 AM EST] And the full chain certs is there:  /home/vpsadmin/.acme.sh/subdomain.yourdomain.com_ecc/fullchain.cer
    ```

3. Look closely, and you will find that the issuer domain this time is `https://acme-v02.api.letsencrypt.org`. The `staging` is gone, which naturally means it is the "Official Server" (Production)!

## 6.5 Certificate Installation

1. After the certificate application is complete, it needs to be installed. Install it to the specified location and reference it in the configuration file:

    ```shell
    vpsadmin@vps-server:~$ acme.sh --installcert -d subdomain.yourdomain.com --cert-file /path/to/installation/cert.crt --key-file /path/to/installation/cert.key --fullchain-file /path/to/installation/fullchain.crt --ecc
    [Mon 14 Feb 2022 03:00:25 PM CST] Installing cert to: /etc/xray/cert/cert.crt
    [Mon 14 Feb 2022 03:00:25 PM CST] Installing key to: /etc/xray/cert/cert.key
    [Mon 14 Feb 2022 03:00:25 PM CST] Installing full chain to: /etc/xray/cert/fullchain.crt
    ```

## 6.6 Your Progress

At this point, the two pieces of infrastructure required by Xray are finally in place! The long-awaited Xray is about to be unveiled. We are finally entering the most exciting chapter!

> ⬛⬛⬛⬛⬛⬛⬜⬜ 75%
