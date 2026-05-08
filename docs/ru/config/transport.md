# Конфигурация транспорта

Конфигурация транспорта определяет, как текущий экземпляр Xray взаимодействует с другой стороной. Этой стороной может быть как другой узел Xray, так и обычный публичный сетевой адрес.

Она описывает часть ниже самого прокси-протокола: способ переноса потока, защиту транспорта и дополнительные низкоуровневые настройки.

Эти три группы относятся к разным уровням и в определенных пределах могут комбинироваться:

- Способы передачи определяют, как именно переносится поток данных, например через RAW, WebSocket, gRPC или Hysteria.
- Безопасность транспорта определяет механизм защиты, например TLS или REALITY.
- Дополнительные настройки управляют низкоуровневым сетевым поведением и финальной маскировкой трафика.

Часть параметров транспорта напрямую влияет на способ установления соединения с удаленной стороной. Для параметров, которые требуют согласования, обе стороны обычно должны использовать совместимые настройки. Например, если одна сторона использует WebSocket, другая тоже должна использовать WebSocket, иначе соединение не будет установлено.

Для прямых исходящих соединений, таких как [Freedom](./outbounds/freedom.md), другой стороной может быть не другой узел Xray, а просто публичный адрес назначения. В этом случае конфигурация транспорта не используется для согласования с другим Xray, а управляет локальным исходящим соединением. В таком сценарии доступен только `sockopt`.

## StreamSettingsObject

`StreamSettingsObject` соответствует полю `streamSettings` в [`InboundObject`](./inbound.md) или [`OutboundObject`](./outbound.md). Каждый inbound или outbound может иметь собственную конфигурацию транспорта.

```json
{
  // пример для outbound, аналогично применимо к inbound
  "outbounds": [
    {
      // ...
      "streamSettings": {
        // [!code focus:16]
        // Способы передачи
        "network": "raw",
        "rawSettings": {},
        "xhttpSettings": {},
        "kcpSettings": {},
        "grpcSettings": {},
        "wsSettings": {},
        "httpupgradeSettings": {},
        "hysteriaSettings": {},
        // Безопасность транспорта
        "security": "none",
        "realitySettings": {},
        "tlsSettings": {},
        // Дополнительные настройки
        "finalmask": {},
        "sockopt": {}
      }
    }
  ]
}
```

> `network`: "raw" | "xhttp" | "mkcp" | "grpc" | "websocket" | "httpupgrade" | "hysteria"

Способ передачи, используемый потоком данных. Значение по умолчанию — `raw`.

> `rawSettings`: [RawObject](./transports/raw.md)

Настройки RAW для потока данных. Действуют только когда `network` равно `raw`.

> `xhttpSettings`: [XHTTPObject](./transports/xhttp.md)

Настройки XHTTP для потока данных. Действуют только когда `network` равно `xhttp`.

> `kcpSettings`: [KcpObject](./transports/mkcp.md)

Настройки mKCP для потока данных. Действуют только когда `network` равно `mkcp`.

> `grpcSettings`: [GRPCObject](./transports/grpc.md)

Настройки gRPC для потока данных. Действуют только когда `network` равно `grpc`.

> `wsSettings`: [WebSocketObject](./transports/websocket.md)

Настройки WebSocket для потока данных. Действуют только когда `network` равно `websocket`.

> `httpupgradeSettings`: [HTTPUpgradeObject](./transports/httpupgrade.md)

Настройки HTTPUpgrade для потока данных. Действуют только когда `network` равно `httpupgrade`.

> `hysteriaSettings`: [HysteriaObject](./transports/hysteria.md)

Настройки Hysteria для потока данных. Действуют только когда `network` равно `hysteria`.

---

> `security`: "none" | "reality" | "tls"

Включать ли защиту транспорта. Поддерживаются следующие значения:

- `"none"` означает, что защита отключена (значение по умолчанию)
- `"reality"` означает использование REALITY
- `"tls"` означает использование [TLS](https://ru.wikipedia.org/wiki/Протокол_защиты_транспортного_уровня)

> `realitySettings`: [RealityObject](./transports/reality.md)

Настройки REALITY. REALITY — это модификация TLS, которая использует внешний вид и характеристики рукопожатия целевого сайта как маскировку.

Действуют только когда `security` равно `reality`.

::: tip
REALITY сейчас является одной из самых сильных схем защиты транспорта, а снаружи такой трафик выглядит максимально похоже на обычный веб-трафик. В сочетании с подходящим режимом XTLS Vision можно также получить прирост производительности в несколько раз или даже больше чем в десять раз.
:::

> `tlsSettings`: [TLSObject](./transports/tls.md)

Настройки TLS. Реализация TLS предоставляется Go. В обычных условиях переговоры обычно приходят к TLS 1.3. DTLS не поддерживается.

Действуют только когда `security` равно `tls`.

---

> `finalmask`: [FinalMaskObject](./transports/finalmask.md)

Настройки FinalMask для финальной маскировки трафика.

> `sockopt`: [SockoptObject](./transports/sockopt.md)

Настройки низкоуровневого сетевого поведения.
