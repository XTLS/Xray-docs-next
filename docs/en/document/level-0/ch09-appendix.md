# [Chapter 9] Resources:

## 1. Little White Linux Basic Command Index

|   Index  | The Command         | Command Description                                          |                  Appeared season                        |
| :------: | :------------------:| :----------------------------------------------------------: | :-----------------------------------------------------: |
| `cmd-01` | `apt update`        | Check for software updates                                   |  [《Remote Login》](./ch03-ssh.md)                      |
| `cmd-02` | `apt upgrade`       | Execute software updates                                     |  [《Remote Login》](./ch03-ssh.md)                      |
| `cmd-03` | `nano`              | Text editor                                                  |  [《Safety protection》](./ch04-security.md)            |
| `cmd-04` | `systemctl restart` | Restart a service                                            |  [《Safety protection》](./ch04-security.md)            |
| `cmd-05` | `adduser`           | Add a user to the system                                     |  [《Safety protection》](./ch04-security.md)            |
| `cmd-06` | `apt install`       | Install a software                                           |  [《Safety protection》](./ch04-security.md)            |
| `cmd-07` | `visudo`            | Modify sudo permissions settings                             |  [《Safety protection》](./ch04-security.md)            | 
| `cmd-08` | `sudo`              | Run a command with `root` privileges                         |  [《Safety protection》](./ch04-security.md)            |  
| `cmd-09` | `chmod`             | Modify permissions                                           |  [《Safety protection》](./ch04-security.md)            |
| `cmd-10` | `mkdir`             | Create a new folder/directory                                |  [《Website construction》](./ch05-webpage.md)          |
| `cmd-11` | `systemctl reload`  | Reload a service                                             |  [《Website construction》](./ch05-webpage.md)          |
| `cmd-12` | `wget`              | Download a web file                                          |  [《Certificate Management》](./ch06-certificates.md)   |
| `cmd-13` | `acme.sh`           | certificate management                                       |  [《Certificate Management》](./ch06-certificates.md)   |
| `cmd-14` | `rm`                | Delete Command                                               |  [《Xray Server》](./ch07-xray-server.md)   |
| `cmd-15` | `crontab -e`        | Edit the current user's scheduled tasks                      |  [《Xray Server》](./ch07-xray-server.md)   |
| `cmd-16` | `touch`             | Create a blank file                                          |  [《Xray Server》](./ch07-xray-server.md)   |
| `cmd-17` | `systemctl`         | `systemd`Basic service management commands                   |  [《Xray Server》](./ch07-xray-server.md)   |
| `cmd-18` | `reboot`            | Reboot the Linux system Or you can unplug your computer :)   |  [《Xray Server》](./ch07-xray-server.md)   |

## 2. Linux important configuration file index

|   Index   |       Configuration file location       |        File Description                                   |            Chapter Appearance                   |
| :-------: | :-------------------------------------: | :-------------------------------------------------------- | :---------------------------------------------: |
| `conf-01` | `/etc/ssh/sshd_config`                  |         SSH settings                                      |      [《Remote Login》](./ch03-ssh.md)          |
| `conf-02` | `/etc/nginx/nginx.conf`                 |         Nginx settings                                    |   [《Website construction》](./ch05-webpage.md) |
| `conf-03` | `/etc/apt/sources.list`                 |         apt resources                                     |     [《Xray Server》](./ch07-xray-server.md)    |
| `conf-04` | `/etc/apt/sources.list.d/vpsadmin.list` |         User-defined software source list                 |      [《Xray Server》](./ch07-xray-server.md)   |
| `conf-05` | `crontab -e`                            |         Scheduled tasks for the current user              |     [《Xray Server》](./ch07-xray-server.md)    |
| `conf-06` | `/etc/sysctl.conf`                      |         Manually set kernel parameters                    |     [《Xray Server》](./ch07-xray-server.md)    |
| `conf-07` | `/etc/sysctl.d/vpsadmin.conf`           |         User-defined kernel parameter configuration file  |     [《Xray Server》](./ch07-xray-server.md)    |

## 3. Xray Important File Index

|   Index   |      Configuration file location     |   File Description    |                Chapter Appearance                  |
| :-------: | :-----------------------------------: | :--------------------: | :------------------------------------------------: |
| `xray-01` | `/usr/local/etc/xray/config.json`    | Xray program settings | [《Xray Server》](./ch07-xray-server.md)           |
| `xray-02` | `/home/vpsadmin/xray_cert/xray.cert` | TLS Certificates      | [《Xray Server》](./ch07-xray-server.md)           |
| `xray-03` | `/home/vpsadmin/xray_cert/xray.key`  | TLS Private Keys      | [《Xray Server》](./ch07-xray-server.md)           |
| `xray-04` | `/home/vpsadmin/xray_log/access.log` | Xray Access Logs      | [《Xray Server》](./ch07-xray-server.md)           |
| `xray-05` | `/home/vpsadmin/xray_log/error.log`  | Xray Error Logs       | [《Xray Server》](./ch07-xray-server.md)           |
