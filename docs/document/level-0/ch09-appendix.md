# 【第 9 章】附录

## 1. 小小白白 Linux 基础命令索引

|   编号   | 命令名称            | 命令说明                     |                  出现篇章                  |
| :------: | :------------------ | :--------------------------- | :----------------------------------------: |
| `cmd-01` | `apt update`        | 查询软件更新                 |      [《远程登录篇》](./ch03-ssh.md)       |
| `cmd-02` | `apt upgrade`       | 执行软件更新                 |      [《远程登录篇》](./ch03-ssh.md)       |
| `cmd-03` | `nano`              | 文本编辑器                   |    [《安全防护篇》](./ch04-security.md)    |
| `cmd-04` | `systemctl restart` | 重启某个服务                 |    [《安全防护篇》](./ch04-security.md)    |
| `cmd-05` | `adduser`           | 给系统新增用户               |    [《安全防护篇》](./ch04-security.md)    |
| `cmd-06` | `apt install`       | 安装某个软件                 |    [《安全防护篇》](./ch04-security.md)    |
| `cmd-07` | `visudo`            | 修改 sudo 权限设置专用编辑器 |    [《安全防护篇》](./ch04-security.md)    |
| `cmd-08` | `sudo`              | 用`root`权限运行某个命令     |    [《安全防护篇》](./ch04-security.md)    |
| `cmd-09` | `chmod`             | 修改目标文件/文件夹的权限    |    [《安全防护篇》](./ch04-security.md)    |
| `cmd-10` | `mkdir`             | 新建文件夹                   |    [《网站建设篇》](./ch05-webpage.md)     |
| `cmd-11` | `systemctl reload`  | 重新加载某个服务             |    [《网站建设篇》](./ch05-webpage.md)     |
| `cmd-12` | `wget`              | 访问（或下载）某个网页文件   |  [《证书管理篇》](./ch06-certificates.md)  |
| `cmd-13` | `acme.sh`           | acme.sh 证书管理相关的命令   |  [《证书管理篇》](./ch06-certificates.md)  |
| `cmd-14` | `rm`                | 删除命令                     | [《Xray 服务器篇》](./ch07-xray-server.md) |
| `cmd-15` | `crontab -e`        | 编辑当前用户的定时任务       | [《Xray 服务器篇》](./ch07-xray-server.md) |
| `cmd-16` | `touch`             | 建立空白文件                 | [《Xray 服务器篇》](./ch07-xray-server.md) |
| `cmd-17` | `systemctl`         | `systemd`基本服务管理命令    | [《Xray 服务器篇》](./ch07-xray-server.md) |
| `cmd-18` | `reboot`            | 重启 Linux 系统              | [《Xray 服务器篇》](./ch07-xray-server.md) |

## 2. 小小白白 Linux 重要配置文件索引

|   编号    | 配置文件位置                            | 文件说明                       |                  出现篇章                  |
| :-------: | :-------------------------------------- | :----------------------------- | :----------------------------------------: |
| `conf-01` | `/etc/ssh/sshd_config`                  | SSH 远程登录程序设置           |      [《远程登录篇》](./ch03-ssh.md)       |
| `conf-02` | `/etc/nginx/nginx.conf`                 | Nginx 程序设置                 |    [《网站建设篇》](./ch05-webpage.md)     |
| `conf-03` | `/etc/apt/sources.list`                 | apt 软件源列表                 | [《Xray 服务器篇》](./ch07-xray-server.md) |
| `conf-04` | `/etc/apt/sources.list.d/vpsadmin.list` | 用户自定义软件源列表列表       | [《Xray 服务器篇》](./ch07-xray-server.md) |
| `conf-05` | `crontab -e`                            | 当前用户的定时任务             | [《Xray 服务器篇》](./ch07-xray-server.md) |
| `conf-06` | `/etc/sysctl.conf`                      | 手动设置 kernel 参数           | [《Xray 服务器篇》](./ch07-xray-server.md) |
| `conf-07` | `/etc/sysctl.d/vpsadmin.conf`           | 用户自定义 kernel 参数配置文件 | [《Xray 服务器篇》](./ch07-xray-server.md) |

## 3. 小小白白 Xray 重要文件索引

|   编号    | 配置文件位置                         | 文件说明      |                  出现篇章                  |
| :-------: | :----------------------------------- | :------------ | :----------------------------------------: |
| `xray-01` | `/usr/local/etc/xray/config.json`    | Xray 程序设置 | [《Xray 服务器篇》](./ch07-xray-server.md) |
| `xray-02` | `/home/vpsadmin/xray_cert/xray.cert` | TLS 证书      | [《Xray 服务器篇》](./ch07-xray-server.md) |
| `xray-03` | `/home/vpsadmin/xray_cert/xray.key`  | TLS 私钥      | [《Xray 服务器篇》](./ch07-xray-server.md) |
| `xray-04` | `/home/vpsadmin/xray_log/access.log` | Xray 访问日志 | [《Xray 服务器篇》](./ch07-xray-server.md) |
| `xray-05` | `/home/vpsadmin/xray_log/error.log`  | Xray 错误日志 | [《Xray 服务器篇》](./ch07-xray-server.md) |
