# 【第9章】附录

## 1. 小小白白Linux基础命令索引

| 编号 | 命令名称 | 命令说明 | 出现篇章 |
|:--:|:--|:--|:--:|
| `cmd-01` | `apt update` | 查询软件更新 | [《远程登录篇》](../ch03-ssh) |
| `cmd-02` | `apt upgrade` | 执行软件更新 | [《远程登录篇》](../ch03-ssh) |
| `cmd-03` | `nano` | 文本编辑器 | [《安全防护篇》](../ch04-security) |
| `cmd-04` | `systemctl restart` | 重启某个服务 | [《安全防护篇》](../ch04-security) |
| `cmd-05` | `adduser` | 给系统新增用户 | [《安全防护篇》](../ch04-security) |
| `cmd-06` | `apt install` | 安装某个软件 | [《安全防护篇》](../ch04-security) |
| `cmd-07` | `visudo` | 修改sudo权限设置专用编辑器 | [《安全防护篇》](../ch04-security) |
| `cmd-08` | `sudo` | 用`root`权限运行某个命令 | [《安全防护篇》](../ch04-security) |
| `cmd-09` | `chmod` | 修改目标文件/文件夹的权限 | [《安全防护篇》](../ch04-security) |
| `cmd-10` | `mkdir` | 新建文件夹 | [《网站建设篇》](../ch05-webpage) |
| `cmd-11` | `systemctl reload` | 重新加载某个服务 | [《网站建设篇》](../ch05-webpage) |
| `cmd-12` | `wget` | 访问（或下载）某个网页文件 | [《证书管理篇》](../ch06-certificates) |
| `cmd-13` | `acme.sh` | acme.sh证书管理相关的命令 | [《证书管理篇》](../ch06-certificates) |
| `cmd-14` | `rm` | 删除命令 | [《Xray服务器篇》](../ch07-xray-server) |
| `cmd-15` | `crontab -e` | 编辑当前用户的定时任务 | [《Xray服务器篇》](../ch07-xray-server) |
| `cmd-16` | `touch` | 建立空白文件 | [《Xray服务器篇》](../ch07-xray-server) |
| `cmd-17` | `systemctl` | `systemd`基本服务管理命令 | [《Xray服务器篇》](../ch07-xray-server) |
| `cmd-18` | `reboot` | 重启Linux系统 | [《Xray服务器篇》](../ch07-xray-server) |


## 2. 小小白白Linux重要配置文件索引

| 编号 | 配置文件位置 | 文件说明 | 出现篇章 |
|:--:|:--|:--|:--:|
| `conf-01` | `/etc/ssh/sshd_config` | SSH远程登录程序设置 | [《远程登录篇》](../ch03-ssh) |
| `conf-02` | `/etc/nginx/nginx.conf` | Nginx程序设置 | [《网站建设篇》](../ch05-webpage) |
| `conf-03` | `/etc/apt/sources.list` | apt软件源列表 | [《Xray服务器篇》](../ch07-xray-server) |
| `conf-04` | `/etc/apt/sources.list.d/vpsadmin.list` | 用户自定义软件源列表列表 | [《Xray服务器篇》](../ch07-xray-server) |
| `conf-05` | `crontab -e` | 当前用户的定时任务 | [《Xray服务器篇》](../ch07-xray-server) |
| `conf-06` | `/etc/sysctl.conf` | 手动设置kernel参数 | [《Xray服务器篇》](../ch07-xray-server) |
| `conf-07` | `/etc/sysctl.d/vpsadmin.conf` | 用户自定义kernel参数配置文件 | [《Xray服务器篇》](../ch07-xray-server) |



## 3. 小小白白Xray重要文件索引


| 编号 | 配置文件位置 | 文件说明 | 出现篇章 |
|:--:|:--|:--|:--:|
| `xray-01` | `/usr/local/etc/xray/config.json` | Xray程序设置 | [《Xray服务器篇》](../ch07-xray-server) |
| `xray-02` | `/home/vpsadmin/xray_cert/xray.cert` | TLS证书 | [《Xray服务器篇》](../ch07-xray-server) |
| `xray-03` | `/home/vpsadmin/xray_cert/xray.key` | TLS私钥 | [《Xray服务器篇》](../ch07-xray-server) |
| `xray-04` | `/home/vpsadmin/xray_log/access.log` | Xray访问日志 | [《Xray服务器篇》](../ch07-xray-server) |
| `xray-05` | `/home/vpsadmin/xray_log/error.log` | Xray错误日志 | [《Xray服务器篇》](../ch07-xray-server) |
