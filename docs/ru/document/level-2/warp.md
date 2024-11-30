---
title: Повышение безопасности проксирования с помощью Cloudflare Warp
---

# Повышение безопасности проксирования с помощью Cloudflare Warp

В Xray (1.6.5+) добавлен исходящий WireGuard.  Хотя это увеличивает размер ядра из-за дополнительных кода и зависимостей, мы считаем, что это важная новая функция по трем причинам:

1. Из недавних обсуждений и [экспериментов](https://github.com/net4people/bbs/issues/129#issuecomment-1308102504) мы знаем, что проксирование трафика в Китай небезопасно.  
    Одним из способов решения этой проблемы является перенаправление трафика в Китай в черный дыры.  
    Недостаток этого метода заключается в том, что geosite и geoip обновляются нерегулярно, и новички могут не знать, как правильно настроить разделение трафика на клиенте, в результате чего трафик попадает в черный дыры, что снижает удобство использования.  
    В этом случае мы можем просто перенаправить трафик в Китай через Cloudflare Warp, что обеспечит такую же безопасность без ущерба для удобства использования.
2. Как известно, большинство VPN-провайдеров ведут журналы посещенных пользователями доменов, а некоторые даже проверяют и блокируют определенный трафик.  
    Один из способов защиты конфиденциальности пользователей - использовать цепочку прокси-серверов на клиенте.  
    Warp использует легкий VPN-протокол WireGuard, который добавляет дополнительный уровень шифрования.  
    Для VPN-провайдера весь трафик пользователя будет направляться на Warp, что обеспечивает максимальную защиту конфиденциальности.
3. Простота использования.  
    Для настройки разделения трафика, WireGuard-туннеля и цепочки прокси-серверов достаточно одного ядра.

## Создание аккаунта Warp

### Спасибо Cloudflare за содействие свободному интернету!  Теперь вы можете бесплатно пользоваться услугами Warp.  При подключении автоматически выбирается ближайший сервер.
#### Метод 1:
1. Используйте VPS и загрузите [wgcf](https://github.com/ViRb3/wgcf/releases).
2. Запустите `wgcf register`, чтобы создать файл `wgcf-account.toml`.
3. Запустите `wgcf generate`, чтобы создать файл `wgcf-profile.conf`. Скопируйте его содержимое:

```ini
[Interface]
PrivateKey = Мой закрытый ключ
Address = 172.16.0.2/32
Address = 2606:4700:110:8949:fed8:2642:a640:c8e1/128
DNS = 1.1.1.1
MTU = 1280
[Peer]
PublicKey = Открытый ключ Warp
AllowedIPs = 0.0.0.0/0
AllowedIPs = ::/0
Endpoint = engage.cloudflareclient.com:2408
```
#### Метод 2:
1. Используйте [warp-reg.sh](https://github.com/chise0713/warp-reg.sh). Запустите:
```
bash -c "$(curl -L warp-reg.vercel.app)"
```
- Вывод:
```json
{
    "endpoint":{
       "v4": "162.159.192.7",
       "v6": "[2606:4700:d0::a29f:c007]",
    },
    "reserved_dec": [35, 74, 190],
    "reserved_hex": "0x234abe",
    "reserved_str": "I0q+",
    "private_key": "yL0kApRiZW4VFfNkKAQ/nYxnMFT3AH0dfVkj1GAlr1k=",
    "public_key": "bmXOC+F1FxEMF9dyiK2H5/1SUtzH0JuVo51h2wPfgyo=",
    "v4": "172.16.0.2",
    "v6": "2606:4700:110:81f3:2a5b:3cad:9d4:9ea6"
}
```
2. Скопируйте вывод.
#### Метод 3:
1. Используйте [wgcf-cli](https://github.com/ArchiveNetwork/wgcf-cli).  Запустите следующие команды для установки:
```
bash -c "$(curl -L wgcf-cli.vercel.app)"
```
2. Запустите `wgcf-cli register` для регистрации. Вывод:
```json
❯ wgcf-cli register
{
    "endpoint": {
        "v4": "162.159.192.7:0",
        "v6": "[2606:4700:d0::a29f:c007]:0"
    },
    "reserved_str": "6nT5",
    "reserved_hex": "0xea74f9",
    "reserved_dec": [
        234,
        116,
        249
    ],
    "private_key": "WIAKvgUlq5fBazhttCvjhEGpu8MmGHcb1H0iHSGlU0Q=",
    "public_key": "bmXOC+F1FxEMF9dyiK2H5/1SUtzH0JuVo51h2wPfgyo=",
    "addresses": {
        "v4": "172.16.0.2",
        "v6": "2606:4700:110:8d9c:3c4e:2190:59d1:2d3c"
    }
}
```
- Полный файл будет сохранен в файле `wgcf.json` в рабочем каталоге.
3. Если у вас есть ключ Warp+, вы можете привязать его, запустив `wgcf-cli license -l [ключ]`.
- (Ключ можно получить, отправив `/keyget@getwarpplusbot` в [нашем чате](https://t.me/projectXray/)).  
    Вывод:
```json
❯ wgcf-cli license -l 9zs5I61a-l9j8m7T5-4pC6k20X
{
    "id": "cd7f4695-e9ef-4bb0-b412-5f4d84919db7",
    "created": "0001-01-01T00:00:00Z",
    "updated": "2023-12-14T12:32:18.689777921Z",
    "premium_data": 0,
    "quota": 0,
    "warp_plus": true,
    "referral_count": 0,
    "referral_renewal_countdown": 0,
    "role": "child"
}
```
4. Запустите `wgcf-cli generate --xray`, чтобы создать исходящий WireGuard.  
    Содержимое будет сохранено в файле `wgcf.json.xray.json`.
- Пример файла:
```json
{
    "protocol": "wireguard",
    "settings": {
        "secretKey": "6CRVRLgFwGajnikoVOPTDNZnDhx3EydhPsMgpxHfBCY=",
        "address": [
            "172.16.0.2/32",
            "2606:4700:110:857a:6a95:fe27:1870:2a9d/128"
        ],
        "peers": [
            {
                "publicKey": "bmXOC+F1FxEMF9dyiK2H5/1SUtzH0JuVo51h2wPfgyo=",
                "allowedIPs": [
                    "0.0.0.0/0",
                    "::/0"
                ],
                "endpoint": "162.159.192.1:2408"
            }
        ],
        "reserved": [
            240,
            25,
            146
        ],
        "mtu": 1280
    },
    "tag": "wireguard"
}
```
## Перенаправление трафика в Китай через Warp на сервере

Добавьте исходящий WireGuard к существующим исходящим подключениям:

```json
{
  "protocol": "wireguard",
  "settings": {
    "secretKey": "Мой закрытый ключ",
    "address": ["172.16.0.2/32", "2606:4700:110:8949:fed8:2642:a640:c8e1/128"],
    "peers": [
      {
        "publicKey": "Открытый ключ Warp",
        "endpoint": "engage.cloudflareclient.com:2408"
      }
    ],
    "reserved":[0, 0, 0] // Вставьте reserved, если у вас есть.
  },
  "tag": "wireguard-1"
}
```

Рекомендуется использовать стратегию маршрутизации `IPIfNonMatch`.

Добавьте следующие правила к существующим правилам маршрутизации:

```json
            {
                "type": "field",
                "domain": [
                    "geosite:cn"
                ],
                "outboundTag": "wireguard-1"
            },
            {
                "type": "field",
                "ip": [
                    "geoip:cn"
                ],
                "outboundTag": "wireguard-1"
            },
```

## Использование Warp в качестве прокси-сервера в цепочке на клиенте

```json
{
   "outbounds":[
      {
         "protocol":"wireguard",
         "settings":{
            "secretKey":"Мой закрытый ключ",
            "peers":[
               {
                  "publicKey":"Открытый ключ Warp",
                  "endpoint":"engage.cloudflareclient.com:2408"
               }
            ],
            "reserved":[0, 0, 0] // Вставьте reserved, если у вас есть.
         },
         "streamSettings":{
            "sockopt":{
               "dialerProxy":"proxy"
            }
         },
         "tag":"wireguard-1"
      },
      {
         "tag":"proxy",
         "protocol":"vmess",
         "settings":{
            "vnext":[
               {
                  "address":"Мой IP-адрес",
                  "port":Мой порт,
                  "users":[
                     {
                        "id":"Мой UUID",
                        "security":"auto"
                     }
                  ]
               }
            ]
         },
         "streamSettings":{
            "network":"tcp"
         }
      }
   ]
}
```


