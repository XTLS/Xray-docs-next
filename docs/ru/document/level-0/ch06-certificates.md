# 【Глава 6】 Управление сертификатами

## 6.1 Получение SSL-сертификата

Теперь нам нужно получить действующий SSL-сертификат для нашего доменного имени, чтобы веб-сайт работал по протоколу HTTPS.  Это важнейший инструмент для обеспечения безопасности трафика при использовании современных VPN-сервисов, таких как Xray.

::: warning
Не используйте самоподписанные сертификаты.  Это ненамного упростит задачу, но создаст дополнительные риски (например, возможность атак типа «человек посередине»).
:::

Мы будем использовать инструмент для управления сертификатами [`acme.sh`](https://github.com/acmesh-official/acme.sh).  Он простой, лёгкий, эффективный и умеет автоматически обновлять сертификаты.

Я уверен, что вы уже освоились с базовыми командами Linux, поэтому скриншоты с выводом команд, которые мы уже использовали ранее, будут опущены.  Если вы забыли, как выполнять ту или иную команду, вернитесь и перечитайте предыдущие главы.

## 6.2 Установка `acme.sh`

1. Базовые команды Linux:
   | Номер | Команда     | Описание                       |
   | :----: | :---------- | :---------------------------- |
   | `cmd-12` | `wget`     | Загрузка файла из интернета    |
   | `cmd-13` | `acme.sh` | Управление сертификатами    |

2. Запустите скрипт установки:

   ```shell
   wget -O -  https://get.acme.sh | sh
   ```

3. Сделайте команду `acme.sh` доступной:

   ```shell
   . .bashrc
   ```

4. Включите автоматическое обновление `acme.sh`:

   ```shell
   acme.sh --upgrade --auto-upgrade
   ```

5. Весь процесс установки показан на гифке ниже:

   ![Установка acme.sh](./ch06-img01-acme-install.gif)

## 6.3 Тестовый запрос сертификата

Перед тем, как запросить настоящий сертификат, давайте сделаем тестовый запрос (`--issue --test`), чтобы убедиться, что всё настроено правильно.  Это позволит избежать превышения лимита на количество запросов Let's Encrypt (например, не более 5 неудачных запросов в час для одного домена и одного аккаунта).

1. Команда для тестового запроса сертификата (в этой статье мы будем использовать сертификаты **ECC**, поскольку на сегодняшний день нет причин не использовать их):

   ```shell
   acme.sh --issue --server letsencrypt --test -d поддомен.ваш_домен.com -w /home/vpsadmin/www/webpage --keylength ec-256
   ```

   ::: warning Пояснение
   Главное преимущество **ECC-сертификатов** — это меньший размер ключа, что означает более высокий уровень безопасности при том же размере ключа, а также более высокую скорость шифрования и расшифровки.  Например, ECC-256 обеспечивает уровень безопасности, примерно соответствующий RSA-3072, так зачем же отказываться от ECC?  Некоторые утверждают, что рукопожатие TLS с ECC-сертификатами происходит заметно быстрее.  Я считаю, что это преувеличение.  RSA-рукопожатие и так достаточно быстрое, а разница в скорости, если она и есть, составляет всего несколько миллисекунд и практически незаметна.

   Конечно, если вам нужно обеспечить совместимость с очень старыми устройствами, то можно использовать и RSA-сертификат.
   :::

2. В случае успеха вы увидите примерно такой вывод:

   ```log
   [Wed 30 Dec 2022 04:25:12 AM EST] Using ACME_DIRECTORY: https://acme-staging-v02.api.letsencrypt.org/directory
   [Wed 30 Dec 2022 04:25:13 AM EST] Using CA: https://acme-staging-v02.api.letsencrypt.org/directory
   [Wed 30 Dec 2022 04:25:13 AM EST] Create account key ok.
   [Wed 30 Dec 2022 04:25:13 AM EST] Registering account: https://acme-staging-v02.api.letsencrypt.org/directory
   [Wed 30 Dec 2022 04:25:13 AM EST] Registered
   [Wed 30 Dec 2022 04:25:13 AM EST] ACCOUNT_THUMBPRINT='CU6qmPKuRqhyTAIrF4swosR375194z_1ddUlWef8xDc'
   [Wed 30 Dec 2022 04:25:13 AM EST] Creating domain key
   [Wed 30 Dec 2022 04:25:13 AM EST] The domain key is here: /home/vpsadmin/.acme.sh/поддомен.ваш_домен.com_ecc/поддомен.ваш_домен.com.key
   [Wed 30 Dec 2022 04:25:13 AM EST] Single domain='поддомен.ваш_домен.com'
   [Wed 30 Dec 2022 04:25:13 AM EST] Getting domain auth token for each domain
   [Wed 30 Dec 2022 04:25:14 AM EST] Getting webroot for domain='поддомен.ваш_домен.com'
   [Wed 30 Dec 2022 04:25:14 AM EST] Verifying: поддомен.ваш_домен.com
   [Wed 30 Dec 2022 04:25:23 AM EST] Pending
   [Wed 30 Dec 2022 04:25:25 AM EST] Success
   [Wed 30 Dec 2022 04:25:25 AM EST] Verify finished, start to sign.
   [Wed 30 Dec 2022 04:25:25 AM EST] Lets finalize the order.
   [Wed 30 Dec 2022 04:25:25 AM EST] Le_OrderFinalize='https://acme-staging-v02.api.letsencrypt.org/acme/finalize/490205995/7730242871'
   [Wed 30 Dec 2022 04:25:25 AM EST] Downloading cert.
   [Wed 30 Dec 2022 04:25:25 AM EST] Le_LinkCert='https://acme-staging-v02.api.letsencrypt.org/acme/cert/xujss5xt8i38waubafz2xujss5xt8i38waubz2'
   [Wed 30 Dec 2022 15:21:52 AM EST] Cert success.
   --BEGIN CERTIFICAT--
   sxlYqPvWreKgD5b8JyOQX0Yg2MLoRUoDyqVkd31PthIiwzdckoh5eD3JU7ysYBtN
   cTFK4LGOfjqi8Ks87EVJdK9IaSAu7ZC6h5to0eqpJ5PLhaM3e6yJBbHmYA8w1Smp
   wAb3tdoHZ9ttUIm9CrSzvDBt6BBT6GqYdDamMyCYBLooMyDEM4CUFsOzCRrEqqvC
   2mTTEmhvpojo5rhdTSJxibozyNWTGwoTj0v9pTUeQcGqLIzqi4DowjBHD5guwRid
   SjAFnm6JT2xUQgWFm58A1gv1OhbH1TRPUUmtE1nFEN7YiSjI4xgxqAXT3CLD2EUb
   wXlUrO6c75zSsQP4bRMzgOjJUqHtSb6IEqELzt4M7KzL5iCOruCChCo2DZxUwvVX
   tOoaAyQJzCbTqE6aUqwiKi3gVyoxvDP9mI5JdRYzsDL6GVud7EHPnYeMl9ubLZAK
   0vg84mbMP3f6mYM4KRa1cqiyOIcQPT4AzGFYVv4sm049bZQg7sd0Bz9CaFvE7yDA
   1y17XlgCDnsjxl66bqI1vkENN9XT5xeFHONqc18b5fZEKSIvdX7iWPFWp1PyMPpG
   0pMCP1EymZNFxIMJLgbWqExwLWfPc5Ib3PjBaIqhXPnw6sT2MQSxXwDupq1UJVhV
   7E3hQRVlwI4CXi6WLHJMNvNRyyK87gCrLH1bKYsPeRVaz77poWBq49zwBCts6hPY
   IeF4ltGXyANNIOPEi8vy138fRU4LYh81d8FjOtFfJZogMjwhfNvapqxPMsioPlmX
   TnZu0n7setrVNUEfTMHWqPpDgk5MPrWLA4LapqaDfEX4pwnQJLMwMi6s94z165c0
   iMRSKA1yU5zqv8aNsDfPoY4OkSPWs4MaXgRRSLBsUfZ15DwQXPk76kegHIyxWvwF
   tYw9HKR5QCMK66fa0z4aJoFVFLK0IIOGEZOanRFUCnkLUDd3QZ3YU8lEcrj7Uxos
   haiRNICyC6UfsCJ94a8vcNyMosPv3xBLMp19WXgiFYqEFQkntkv1FLRI35fjeJmg
   0fmD9VG9bkzGPHihJgQLRlCHasGf6XrdfkSsODAyCUHUHJ0RzqF4YEZMcxDxzuQ2
   YO7bFwj7S3mUdVPZ6MPasjxdyBjJgEBMch2uy4AhmudXfEBQBye8W6ZI4ztZjLVV
   FmP4SIuaNUmMe20TjR8b9NVC96AhxOanWT3mRROsdokpKQGTJvl27EHH8KuAbUOc
   G6KtPy4wslNZNXWcBy9n63RcWak12r7kAIFn38tZxmlw2WUKoRSMAH64GcDTjRQd
   Am65hBHzvGrj93wEuVNIebvNIsJOlng3HFjpIxVqKGMCIfWIKGDE3YzK3p4LbGZ6
   NZFQWYJLNVf2M9CCJfbEImPYgvctrxl39H6KVYPCw1SAdaj9NneUqmREOQkKoEB0
   x6PmNirbMscHhQPSC0JQaqUgaQFgba1ALmzRYAnYhNb0twkTxWbY7DBkAarxqMIp
   yiLKcBFc5H7dgJCImo7us7aJeftC44uWkPIjw9AKH=
   --END CERTIFICAT--
   [Wed 30 Dec 2022 15:21:52 AM EST] Your cert is in  /home/vpsadmin/.acme.sh/поддомен.ваш_домен.com_ecc/поддомен.ваш_домен.com.cer
   [Wed 30 Dec 2022 15:21:52 AM EST] Your cert key is in  /home/vpsadmin/.acme.sh/поддомен.ваш_домен.com_ecc/поддомен.ваш_домен.com.key
   [Wed 30 Dec 2022 15:21:52 AM EST] The intermediate CA cert is in  /home/vpsadmin/.acme.sh/поддомен.ваш_домен.com_ecc/ca.cer
   [Wed 30 Dec 2022 15:21:52 AM EST] And the full chain certs is there:  /home/vpsadmin/.acme.sh/поддомен.ваш_домен.com_ecc/fullchain.cer
   ```

3. Обратите внимание, что мы запросили тестовый сертификат, который нельзя использовать в реальной среде.  Он нужен только для проверки корректности настроек.  Если вы посмотрите на вывод команды, то увидите, что сертификат был выпущен сервером `https://acme-staging-v02.api.letsencrypt.org`.  Слово `staging` означает, что это тестовый сервер Let's Encrypt.

4. Если на этом этапе возникли ошибки, выполните следующую команду, чтобы увидеть подробную информацию о процессе запроса сертификата:

   ```shell
   acme.sh --issue --server letsencrypt --test -d поддомен.ваш_домен.com -w /home/vpsadmin/www/webpage --keylength ec-256 --debug
   ```

   Мы просто добавили параметр `--debug` в конец команды.

5. Если тестовый запрос выполнен успешно, можно переходить к запросу настоящего сертификата (тестовый сертификат удалять не нужно, он будет автоматически перезаписан настоящим сертификатом).

## 6.4 Запрос настоящего сертификата

1. Команда для запроса настоящего сертификата (мы просто убираем параметр `--test` и добавляем параметр `--force`):

   ```shell
   acme.sh --set-default-ca --server letsencrypt
   ```

   ```shell
   acme.sh --issue -d поддомен.ваш_домен.com -w /home/vpsadmin/www/webpage --keylength ec-256 --force
   ```

   ::: warning Пояснение
   Параметр `--force` используется для принудительного обновления сертификата до истечения срока действия старого.  В предыдущем шаге мы получили тестовый сертификат, который всё ещё действителен.  Поэтому нам нужно использовать этот параметр.
   :::

2. В случае успеха вы увидите примерно такой же вывод, как и в предыдущем шаге:

   ```log
   vpsadmin@vps-server:~$ acme.sh --issue -d поддомен.ваш_домен.com -w /home/vpsadmin/www/webpage --keylength ec-256
   [Wed 30 Dec 2022 15:22:51 AM EST] Using CA: https://acme-v02.api.letsencrypt.org/directory
   [Wed 30 Dec 2022 15:22:51 AM EST] Creating domain key
   [Wed 30 Dec 2022 15:22:51 AM EST] The domain key is here: /home/vpsadmin/.acme.sh/поддомен.ваш_домен.com_ecc/поддомен.ваш_домен.com.key
   [Wed 30 Dec 2022 15:22:51 AM EST] Single domain='поддомен.ваш_домен.com'
   [Wed 30 Dec 2022 15:22:51 AM EST] Getting domain auth token for each domain
   [Wed 30 Dec 2022 15:22:51 AM EST] Getting webroot for domain='поддомен.ваш_домен.com'
   [Wed 30 Dec 2022 15:22:51 AM EST] Verifying: поддомен.ваш_домен.com
   [Wed 30 Dec 2022 15:22:51 AM EST] Pending
   [Wed 30 Dec 2022 15:22:51 AM EST] Success
   [Wed 30 Dec 2022 15:22:51 AM EST] Verify finished, start to sign.
   [Wed 30 Dec 2022 15:22:51 AM EST] Lets finalize the order.
   [Wed 30 Dec 2022 15:22:51 AM EST] Le_OrderFinalize='https://acme-v02.api.letsencrypt.org/acme/finalize/490205996/7730242872'
   [Wed 30 Dec 2022 15:22:51 AM EST] Downloading cert.
   [Wed 30 Dec 2022 15:22:51 AM EST] Le_LinkCert='https://acme-v02.api.letsencrypt.org/acme/cert/vsxvk0oldnuobe51ayxz4dms62sk2dwmw9zhuw'
   [Wed 30 Dec 2022 15:22:52 AM EST] Cert success.
   --BEGIN CERTIFICAT--
   sxlYqPvWreKgD5b8JyOQX0Yg2MLoRUoDyqVkd31PthIiwzdckoh5eD3JU7ysYBtN
   cTFK4LGOfjqi8Ks87EVJdK9IaSAu7ZC6h5to0eqpJ5PLhaM3e6yJBbHmYA8w1Smp
   wAb3tdoHZ9ttUIm9CrSzvDBt6BBT6GqYdDamMyCYBLooMyDEM4CUFsOzCRrEqqvC
   2mTTEmhvpojo5rhdTSJxibozyNWTGwoTj0v9pTUeQcGqLIzqi4DowjBHD5guwRid
   SjAFnm6JT2xUQgWFm58A1gv1OhbH1TRPUUmtE1nFEN7YiSjI4xgxqAXT3CLD2EUb
   wXlUrO6c75zSsQP4bRMzgOjJUqHtSb6IEqELzt4M7KzL5iCOruCChCo2DZxUwvVX
   tOoaAyQJzCbTqE6aUqwiKi3gVyoxvDP9mI5JdRYzsDL6GVud7EHPnYeMl9ubLZAK
   0vg84mbMP3f6mYM4KRa1cqiyOIcQPT4AzGFYVv4sm049bZQg7sd0Bz9CaFvE7yDA
   1y17XlgCDnsjxl66bqI1vkENN9XT5xeFHONqc18b5fZEKSIvdX7iWPFWp1PyMPpG
   0pMCP1EymZNFxIMJLgbWqExwLWfPc5Ib3PjBaIqhXPnw6sT2MQSxXwDupq1UJVhV
   7E3hQRVlwI4CXi6WLHJMNvNRyyK87gCrLH1bKYsPeRVaz77poWBq49zwBCts6hPY
   IeF4ltGXyANNIOPEi8vy138fRU4LYh81d8FjOtFfJZogMjwhfNvapqxPMsioPlmX
   TnZu0n7setrVNUEfTMHWqPpDgk5MPrWLA4LapqaDfEX4pwnQJLMwMi6s94z165c0
   iMRSKA1yU5zqv8aNsDfPoY4OkSPWs4MaXgRRSLBsUfZ15DwQXPk76kegHIyxWvwF
   tYw9HKR5QCMK66fa0z4aJoFVFLK0IIOGEZOanRFUCnkLUDd3QZ3YU8lEcrj7Uxos
   haiRNICyC6UfsCJ94a8vcNyMosPv3xBLMp19WXgiFYqEFQkntkv1FLRI35fjeJmg
   0fmD9VG9bkzGPHihJgQLRlCHasGf6XrdfkSsODAyCUHUHJ0RzqF4YEZMcxDxzuQ2
   YO7bFwj7S3mUdVPZ6MPasjxdyBjJgEBMch2uy4AhmudXfEBQBye8W6ZI4ztZjLVV
   FmP4SIuaNUmMe20TjR8b9NVC96AhxOanWT3mRROsdokpKQGTJvl27EHH8KuAbUOc
   G6KtPy4wslNZNXWcBy9n63RcWak12r7kAIFn38tZxmlw2WUKoRSMAH64GcDTjRQd
   Am65hBHzvGrj93wEuVNIebvNIsJOlng3HFjpIxVqKGMCIfWIKGDE3YzK3p4LbGZ6
   NZFQWYJLNVf2M9CCJfbEImPYgvctrxl39H6KVYPCw1SAdaj9NneUqmREOQkKoEB0
   x6PmNirbMscHhQPSC0JQaqUgaQFgba1ALmzRYAnYhNb0twkTxWbY7DBkAarxqMIp
   yiLKcBFc5H7dgJCImo7us7aJeftC44uWkPM=
   --END CERTIFICAT--
   [Wed 30 Dec 2022 15:22:52 AM EST] Your cert is in  /home/vpsadmin/.acme.sh/поддомен.ваш_домен.com_ecc/поддомен.ваш_домен.com.cer
   [Wed 30 Dec 2022 15:22:52 AM EST] Your cert key is in  /home/vpsadmin/.acme.sh/поддомен.ваш_домен.com_ecc/поддомен.ваш_домен.com.key
   [Wed 30 Dec 2022 15:22:52 AM EST] The intermediate CA cert is in  /home/vpsadmin/.acme.sh/поддомен.ваш_домен.com_ecc/ca.cer
   [Wed 30 Dec 2022 15:22:52 AM EST] And the full chain certs is there:  /home/vpsadmin/.acme.sh/поддомен.ваш_домен.com_ecc/fullchain.cer
   ```

3. Обратите внимание, что теперь сертификат выдан сервером `https://acme-v02.api.letsencrypt.org` (без слова `staging`), т.е. это настоящий, действующий сертификат.

## 6.5 Установка сертификата

1. После того, как сертификат получен, его нужно установить в определённое место и указать путь к нему в файле конфигурации:

   ```shell
   vpsadmin@vps-server:~$ acme.sh --installcert -d поддомен.ваш_домен.com --cert-file /путь/к/папке/cert.crt --key-file /путь/к/папке/cert.key --fullchain-file /путь/к/папке/fullchain.crt --ecc
   [Mon 14 Feb 2022 03:00:25 PM CST] Installing cert to: /etc/xray/cert/cert.crt
   [Mon 14 Feb 2022 03:00:25 PM CST] Installing key to: /etc/xray/cert/cert.key
   [Mon 14 Feb 2022 03:00:25 PM CST] Installing full chain to: /etc/xray/cert/fullchain.crt
   ```

## 6.6 Ваш прогресс

Наконец-то все необходимые компоненты Xray готовы!  Мы подошли к самому интересному — установке и настройке самого Xray!

> ⬛⬛⬛⬛⬛⬛⬜⬜ 75%




