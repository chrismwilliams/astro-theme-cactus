---
title: "Proxmox_VE自用配置"
description: "Proxmox_VE初次使用配置"
publishDate: "18 04 2025"
tags: ["PVE", "Config", "Linux"]
updatedDate: 18 04 2025
---

# Proxmox_VE自用配置

## 导入镜像
```shell
qm importdisk 100 /var/lib/vz/template/iso/immortalwrt-23.05.1-x86-64-generic-ext4-combined-efi.qcow2 local-lvm
```

#### 查看核显 
```shell
ls -l /dev/dri
```

#### 查看内核版本 
```shell
uname -a
```
### 换源

#### 备份源文件 

```shell
cp /etc/apt/sources.list /etc/apt/sources.list.bak
```

#### 打开源文件 
```shell
nano /etc/apt/sources.list
```
#### 注释掉原有源文件信息 

#### 中科大源 8.0
```shell
deb https://mirrors.ustc.edu.cn/debian/ bookworm main non-free non-free-firmware contrib
deb-src https://mirrors.ustc.edu.cn/debian/ bookworm main non-free non-free-firmware contrib
deb https://mirrors.ustc.edu.cn/debian-security/ bookworm-security main
deb-src https://mirrors.ustc.edu.cn/debian-security/ bookworm-security main
deb https://mirrors.ustc.edu.cn/debian/ bookworm-updates main non-free non-free-firmware contrib
deb-src https://mirrors.ustc.edu.cn/debian/ bookworm-updates main non-free non-free-firmware contrib
deb https://mirrors.ustc.edu.cn/debian/ bookworm-backports main non-free non-free-firmware contrib
deb-src https://mirrors.ustc.edu.cn/debian/ bookworm-backports main non-free non-free-firmware contrib
```
### 保存退出 

#### 备份企业源  
```shell
cp /etc/apt/sources.list.d/pve-enterprise.list /etc/apt/sources.list.d/pve-enterprise.list.bak
```
#### 编辑替换企业源 
```shell
nano /etc/apt/sources.list.d/pve-enterprise.list 
```
#### 科大 8.0
```shell
deb https://mirrors.ustc.edu.cn/proxmox/debian/pve bookworm pve-no-subscription
```

### 保存退出

### 备份ceph 源
```shell
cp /etc/apt/sources.list.d/ceph.list /etc/apt/sources.list.d/ceph.list.bak
```

#### PVE 8 之后默认安装 Ceph 仓库源文件 `/etc/apt/sources.list.d/ceph.list`，可以使用如下命令更换源
```shell
if [ -f /etc/apt/sources.list.d/ceph.list ]; then
  CEPH_CODENAME=`ceph -v | grep ceph | awk '{print $(NF-1)}'`
  source /etc/os-release
  echo "deb https://mirrors.ustc.edu.cn/proxmox/debian/ceph-$CEPH_CODENAME $VERSION_CODENAME no-subscription" > /etc/apt/sources.list.d/ceph.list
fi
```
#### 编辑 PVE ceph 源
```shell
nano /etc/apt/sources.list.d/ceph.list
```
#### 中科大
```shell
deb https://mirrors.ustc.edu.cn/proxmox/debian/ceph-quincy bookworm no-subscription
```

### 更细系统内核
```shell  
apt update && apt dist-upgrade -y
```
### 备份APLinfo  
```shell
cp /usr/share/perl5/PVE/APLInfo.pm /usr/share/perl5/PVE/APLInfo.pm_back
```

### 更换XLC源
```shell
sed -i.bak 's|http://download.proxmox.com|https://mirrors.ustc.edu.cn/proxmox|g' /usr/share/perl5/PVE/APLInfo.pm
```
https://mirrors.ustc.edu.cn/proxmox/images/system/debian-12-standard_12.2-1_amd64.tar.zst

### 重启服务 
```shell
systemctl restart pvedaemon.service
```

### 查看系统详情
```shell
cat /proc/version
```

### 打开gtub
```shell
nano /etc/default/grub
```

### 开启intel设备虚拟化
```shell
GRUB CMDLINE LINUX DEFAULT = "quiet intel_iommu=on"
```

### 保存退出

### 添加直通类目
```shell
nano /etc/modules
```
```shell
vfio
vfio_iommu_type1
vfio_pci
vfio_virgfd
```

### 保存退出 

### 更新配置信息
```shell
update-grub
```

### 更新配置信息
```shell
update-initramfs -u -k all
```

### 更新配置信息
```shell
update-grub
```

### 更新配置信息
```shell
update-initramfs -u
```

### 安装 (设置虚拟核显数量)
```shell
sysfsutils apt install -y sysfsutils
```

### 检查是否成功
```shell
dmesg | grep iommu
```

### 重启PVE

## 开启ipv6
#### 查看内核也已经开启ipv6自动配置
```shell
cat /proc/sys/net/ipv6/conf/vmbr0/accept_ra
1 #返回值
cat /proc/sys/net/ipv6/conf/vmbr0/autoconf
1 #返回值
```
#### 查看已开启ipv6转发：
```shell
cat /proc/sys/net/ipv6/conf/vmbr0/forwarding
1 #返回值
```
#### 需要将accept_ra值改成2才能自动配置SLAAC ipv6地址：
```shell
nano /etc/sysctl.conf
```
#### 最后边添加代码
```shell
net.ipv6.conf.all.accept_ra=2
net.ipv6.conf.default.accept_ra=2
net.ipv6.conf.vmbr0.accept_ra=2
net.ipv6.conf.all.autoconf=1
net.ipv6.conf.default.autoconf=1
net.ipv6.conf.vmbr0.autoconf=1
```

## 开源的PVE状态显示脚本

1. 更新当前Proxmox VE软件包：
```
export LC_ALL=en_US.UTF-8
apt update && apt upgrade -y
```

2. 安装git和wget服务：
```
apt install git wget 
```

3. git拉取脚本：
```
git clone https://github.com/KoolCore/Proxmox_VE_Status.git
```

4. 进入脚本命令行所在目录：
```
cd Proxmox_VE_Status
```

5. 执行脚本
```
bash ./Proxmox_VE_Status_zh.sh
```

6. 执行硬件直通脚本：
```
bash ./passthrough.sh
```

大概1-3分钟后，按下`CTRL+F5`强制刷新本页面即可。如果发现 `curl: (7) Failed to connect to raw.githubusercontent.com port 443: Connection refused` 这种错误，年轻人，你的网络运营商屏蔽了 GitHub。请自行处理网络环境问题。


#### 二、还原方法：

运行以下四条命令（适用于已经改过概要信息，还原成默认的概要信息）：
```shell
sed -i '/PVE::pvecfg::version_text();/,/my $dinfo = df/!b;//!d;s/my $dinfo = df/\n\t&/' /usr/share/perl5/PVE/API2/Nodes.pm
sed -i '/pveversion/,/^\s\+],/!b;//!d;s/^\s\+],/\t    value: '"'"''"'"',\n\t},\n&/' /usr/share/pve-manager/js/pvemanagerlib.js
sed -i '/widget.pveNodeStatus/,/},/ { s/height: [0-9]\+/height: 300/; /textAlign/d}' /usr/share/pve-manager/js/pvemanagerlib.js
systemctl restart pveproxy
```
