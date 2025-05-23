# Протокол VLESS

VLESS - это легковесный, не сохраняющий состояние транспортный протокол, который может служить мостом между клиентом и сервером Xray.

## Запрос и ответ

| 1 байт           | 16 байт            | 1 байт                            | M байт                             | 1 байт  | 2 байта | 1 байт     | S байт | X байт         |
| ---------------- | ------------------ | --------------------------------- | ---------------------------------- | ------- | ------- | ---------- | ------ | -------------- |
| Версия протокола | Эквивалентный UUID | Длина дополнительной информации M | Дополнительная информация ProtoBuf | Команда | Порт    | Тип адреса | Адрес  | Данные запроса |

| 1 байт                                        | 1 байт                            | N байт                             | Y байт        |
| --------------------------------------------- | --------------------------------- | ---------------------------------- | ------------- |
| Версия протокола, совпадает с версией запроса | Длина дополнительной информации N | Дополнительная информация ProtoBuf | Данные ответа |

Структура VLESS была такой же, как указано выше, еще во второй альфа-версии (ALPHA 2) (BETA - это пятая бета-версия):

> "Аутентификация ответа" была заменена на "версию протокола" и перемещена в начало, что позволяет VLESS обновляться, одновременно устраняя накладные расходы на генерацию псевдослучайных чисел. Структура, связанная с обфускацией, была заменена на дополнительную информацию (ProtoBuf) и перемещена вперед, что придало самому протоколу расширяемость с минимальными накладными расходами ([gogo/protobuf](https://github.com/gogo/protobuf)). Если нет дополнительной информации, то нет и связанных с ней накладных расходов.

Я всегда считал, что "аутентификация ответа" не является обязательной. В версии ALPHA для повышения производительности генерации случайных чисел мы заменили crypto/rand на math/rand, а теперь в этом нет необходимости.

"Версия протокола" не только выполняет функцию "аутентификации ответа", но и дает VLESS возможность безболезненно обновлять структуру протокола, открывая бесконечные возможности.
"Версия протокола" во всех бета-версиях равна 0, в официальной версии - 1, а в будущем, если будут несовместимые изменения в структуре протокола, версия должна быть обновлена.

Сервер VLESS спроектирован по принципу switch version, то есть он одновременно поддерживает все версии VLESS. Если требуется обновить версию протокола (что маловероятно), рекомендуется сначала добавить поддержку на сервере за месяц до обновления клиентов. Запрос VMess также имеет версию протокола, но его информация для аутентификации находится снаружи, а часть с командой сильно связана и имеет фиксированное шифрование, что делает версию протокола внутри бессмысленной. Сервер также не проверяет ее, а ответ не имеет версии протокола. В структуре протокола Trojan нет версии протокола.

Далее идет UUID. Сначала я думал, что 16 байт - это многовато, и подумывал о его сокращении, но потом увидел, что Trojan использует 56 печатаемых символов (56 байт), и полностью отказался от этой идеи. Сервер каждый раз проверяет UUID, поэтому производительность также важна: валидатор VLESS прошел через несколько рефакторингов/обновлений, он очень прост и потребляет мало ресурсов по сравнению с VMess, может одновременно поддерживать очень большое количество пользователей, имеет очень высокую производительность и очень высокую скорость проверки (sync.Map). Динамическое добавление и удаление пользователей через API еще более эффективно и плавно.
https://github.com/XTLS/Xray-core/issues/158

Внедрение ProtoBuf - это инновация, о которой мы подробнее поговорим ниже. Структура от "команды" до "адреса" в настоящее время полностью идентична VMess и также поддерживает Mux.

В целом, изменения от ALPHA 2 до BETA в основном заключаются в следующем: эволюция структуры, очистка и консолидация, повышение производительности и улучшение. Все это происходило постепенно, подробнее см. [VLESS Changes](https://github.com/rprx/v2ray-vless/releases).

## ProtoBuf

Кажется, только VLESS опционально поддерживает встроенный ProtoBuf. Это формат обмена данными, в котором информация плотно упакована в двоичный код, структура TLV (Tag Length Value).

Причиной этого послужила статья, в которой утверждалось, что у SS есть некоторые недостатки, например, отсутствие механизма сообщения об ошибках, что не позволяет клиенту предпринимать дальнейшие действия в зависимости от типа ошибки.
(Однако я не согласен с тем, что обо всех ошибках нужно сообщать, иначе нельзя будет предотвратить активное зондирование. В следующей бета-версии сервер сможет возвращать пользовательское сообщение об ошибке.)
Поэтому я подумал, что важно иметь расширяемую структуру, которая в будущем сможет нести, например, команды динамического порта. И не только в ответе, но и в запросе нужна подобная структура.
Сначала я хотел разработать TLV самостоятельно, но потом обнаружил, что ProtoBuf - это именно та структура, готовое решение, которое идеально подходит для этой задачи, и имеет хорошую поддержку различных языков программирования.

В настоящее время "дополнительная информация" содержит только Scheduler и SchedulerV, которые являются заменой MessName и MessSeed. **Если они вам не нужны, "длина дополнительной информации" будет равна 0, и не будет никаких накладных расходов на сериализацию/десериализацию ProtoBuf**. На самом деле я предпочитаю называть этот процесс "склейкой", поскольку pb по сути делает именно это, и накладные расходы минимальны. Склеенные байты очень компактны, практически не отличаются от решения в ALPHA. Желающие могут вывести их и сравнить.

Чтобы указать различный уровень поддержки дополнительной информации (Addons, которые можно рассматривать как плагины, в будущем их может быть много), в следующей бета-версии перед "длиной дополнительной информации" будет добавлена "версия дополнительной информации". 256 - 1 = 255 байт - это достаточно и разумно (65535 - это слишком много, и кто-то может злонамеренно заполнить их), существующие используют только десятую часть, и в будущем не будет такого количества дополнительной информации, а в большинстве случаев дополнительная информация вообще отсутствует. Если этого действительно не хватит, можно обновить версию VLESS.

Чтобы сократить накладные расходы на логические проверки и т.д., Addons пока не будут использовать многоуровневую структуру. Месяц назад появилась идея "изменяемого формата протокола", pb может переставлять поля, но в этом нет необходимости, поскольку современное шифрование не позволяет стороннему наблюдателю увидеть, что заголовки двух передач одинаковы.

Ниже представлены концепции Schedulers и Encryption, **они обе являются необязательными**: одна решает проблему временных характеристик трафика, другая - криптографические проблемы.

## ~~Schedulers~~ Flow

~~Предварительное китайское название: Планировщик трафика~~ (обновление от 03.09.2020: официальное китайское название - "Управление потоком"). Команда передается через ProtoBuf и управляет частью данных.

Я обнаружил, что оригинальная "обфускация метаданных" shake в VMess не вносит никаких значимых изменений при использовании TLS, а только снижает производительность, поэтому в VLESS от нее отказались. Кроме того, термин "обфускация" может быть неверно истолкован как маскировка, поэтому от него тоже отказались. Кстати, я всегда скептически относился к маскировке: если она не может быть полностью идентичной, то это же явная сигнатура? А если может быть полностью идентичной, то почему бы не использовать саму маскировку? Сначала я использовал SSR, но потом понял, что он маскирует трафик только для провайдера, и больше им не пользовался.

Так какую же проблему решает "Планировщик трафика"? Он влияет на макроскопические временные характеристики трафика, а не на микроскопические, которые должны решаться шифрованием. Временные характеристики трафика могут быть обусловлены протоколом, например, рукопожатием Socks5 при использовании Socks5 over TLS. Для наблюдателя различные временные характеристики в TLS соответствуют разным протоколам, поэтому бесконечное количество планировщиков эквивалентно бесконечному количеству протоколов (перераспределение размера отправляемых данных и т.д.). Временные характеристики трафика также могут быть обусловлены поведением, например, сколько файлов загружается при посещении главной страницы Google, в каком порядке и какого размера. Добавление еще одного уровня шифрования не может эффективно скрыть эту информацию.

Schedulers не нужно располагать снаружи, как Encryption, поскольку небольшое количество данных в заголовке ничтожно мало по сравнению с объемом данных, которые следуют за ними.

В BETA 2 планируется выпустить два базовых планировщика: сжатие Zstd и динамическое увеличение объема данных. Более продвинутые операции - это управление и распределение на макроскопическом уровне, которые пока отложены.

## Encryption

В отличие от VMess, где шифрование жестко связано с протоколом, в VLESS сервер и клиент смогут заранее договариваться о методе шифрования и шифровать только внешний слой. Это похоже на использование TLS, которое не влияет на передаваемые данные, и можно рассматривать как замену TLS на заранее согласованное шифрование. По сравнению с жесткой связью такой подход более рационален и гибок: если в одном методе шифрования обнаруживается проблема безопасности, его можно просто заменить на другой. Сервер VLESS также позволит использовать разные методы шифрования одновременно.

По сравнению с VMess, в VLESS достаточно заменить security на encryption, а disableInsecureEncryption на decryption, чтобы решить все проблемы. В настоящее время encryption и decryption принимают только значение "none" и не могут быть пустыми (даже если в будущем будет добавлена проверка безопасности соединения), подробнее см. [документацию по настройке VLESS](https://github.com/rprx/v2fly-github-io/blob/master/docs/config/protocols/vless.md). Encryption не нужно перемещать на уровень выше, во-первых, потому что это не позволит повторно использовать много кода, во-вторых, потому что это повлияет на степень контроля, что станет понятно в будущем.

Поддерживаются два типа шифрования: одно - полностью независимое шифрование, требующее дополнительного пароля, подходит для личного использования, другое - шифрование с использованием существующего UUID, подходит для общего использования.
(Если используется первый тип шифрования и пароль раскрывается каким-либо образом, например, при совместном использовании несколькими людьми, то атака "человек посередине" не за горами.)
Переработанный динамический порт может быть выпущен вместе с шифрованием, команда будет передаваться через ProtoBuf, реализация будет отличаться от динамического порта VMess.

Добавить готовое шифрование довольно просто, нужно добавить всего лишь один уровень writer & reader. В BETA 3 планируется добавить поддержку aes-128-gcm и chacha20-ietf-poly1305 из SS:
в encryption на клиенте можно указать "auto: ss_aes-128-gcm_0_123456, ss_chacha20-ietf-poly1305_0_987654", auto выберет наиболее подходящий для текущей машины, 0 означает бета-версию, а в конце указывается пароль. В decryption на сервере указывается аналогичная строка, и при получении запроса сервер будет пытаться расшифровать его с помощью каждого указанного метода.

Не все комбинации нужно перебирать: шифрование в VMess состоит из трех частей, первая часть - это информация для аутентификации, которая включает UUID, alterId и временной фактор, вторая часть - это часть с командой, которая шифруется с помощью фиксированного алгоритма, команда содержит информацию об алгоритме шифрования, используемом для части с данными, третья часть - это сами данные. Как видно, VMess фактически использует шифрование "многие ко одному" (адаптация на стороне сервера), а не просто шифрование с помощью UUID. Но шифрование только с помощью UUID тоже довольно сложно, и в ближайшее время оно не будет реализовано, учитывая, что у нас уже есть VMessAEAD. Если в VLESS будет реализован способ шифрования с помощью UUID, это будет означать переработку всего VMess.

## Проблемы с UDP

[XUDP: VLESS & VMess & Mux UDP FullCone NAT](https://github.com/XTLS/Xray-core/discussions/252)

## Руководство по разработке клиентов

1. Протокол VLESS сам по себе будет обновляться несовместимым образом, но параметры конфигурации клиента в основном будут только добавляться. Реализация протокола в iOS-клиенте должна обновляться соответствующим образом.
2. **Визуальный стандарт: используйте VLESS в качестве идентификатора в пользовательском интерфейсе**, а не VLess / Vless / vless. Настройки в файле конфигурации не затрагиваются, в коде используйте естественный стиль.
3. `encryption` должен быть реализован в виде текстового поля, а не выпадающего списка. Значение по умолчанию для новых настроек должно быть `none`. Если пользователь оставит поле пустым, туда должно быть автоматически подставлено `none`.

## Стандарт общих ссылок VLESS

Спасибо <img src="https://avatars2.githubusercontent.com/u/7822648?s=32" width="32px" height="32px" alt="a"/> [@DuckSoft](https://github.com/DuckSoft) за предложение!

Подробнее см. [Предложение по стандарту общих ссылок VMessAEAD / VLESS](https://github.com/XTLS/Xray-core/issues/91)
