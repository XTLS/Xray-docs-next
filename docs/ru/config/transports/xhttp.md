# XHTTP: Beyond REALITY

Описание транспорта и примеры настройки см. в обсуждении [XHTTP: Beyond REALITY](https://github.com/XTLS/Xray-core/discussions/4113).

## Multiplex

VLESS Multiplex объединяет потоки приложений. XHTTP отдельно управляет переиспользованием HTTP-соединений через XMUX. При совместном использовании эти настройки влияют на распределение соединений на разных уровнях.

Если в исходящем подключении VLESS с транспортом XHTTP значение `settings.multiplex.concurrency` больше `0`, клиент при загрузке конфигурации пишет `ATTENTION: Using VLESS Multiplex over XHTTP XMUX` и продолжает запуск. Если задан только `xudpConcurrency`, такого предупреждения нет.

XHTTP больше не ограничивает Multiplex только трафиком UDP. Для TCP через Multiplex по-прежнему действуют правила самого VLESS. См. [настройки Multiplex и XUDP](../multiplex.md) и [пояснение к изменению](https://github.com/XTLS/Xray-core/pull/6755#issuecomment-7160365746).
