# Trojan

Протокол [Trojan](https://trojan-gfw.github.io/trojan/protocol).

## OutboundConfigurationObject

`OutboundConfigurationObject` соответствует элементу `settings` в [`OutboundObject`](../outbound.md).

```json
{
  "outbounds": [
    {
      // ...
      "protocol": "trojan",
      // [!code focus:7]
      "settings": {
        "address": "127.0.0.1",
        "port": 1234,
        "password": "password",
        "email": "love@xray.com",
        "level": 0
      }
    }
  ]
}
```

::: warning
Trojan должен использоваться с транспортной защитой [TLS](https://xtls.github.io/config/transports/tls.html); использовать `streamSettings.security: "none"` допустимо только тогда, когда адрес другой стороны является private-адресом (например, частным IP-адресом или частным доменным именем) и сам канал находится в доверенной сети. В публичных средах также требуется Mux; иначе, если внутренняя полезная нагрузка сама является TLS, это превращается в TiT и легко обнаруживается ([PoC](https://github.com/XTLS/Trojan-killer)).
:::

> `address`: address

Адрес сервера, поддерживаются IPv4, IPv6 и доменные имена. Обязательный параметр.

> `port`: number

Порт сервера, обычно тот же, что и порт, прослушиваемый сервером.

> `password`: string

Пароль. Обязательный параметр, любая строка.

> `email`: string

Адрес электронной почты, необязательный параметр, используется для идентификации пользователя.

> `level`: number

Уровень пользователя, для соединения будет использоваться [локальная политика](../policy.md#levelpolicyobject), соответствующая этому уровню пользователя.

Значение level соответствует значению `level` в разделе [policy](../policy.md#policyobject). Если не указано, используется значение по умолчанию - 0.
