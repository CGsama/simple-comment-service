#!/bin/bash
sudo cloudflared service uninstall

if [ -z "${CF_TUNNEL_KEY}" ]
then
    echo 'use trycloudflare.com'
    cloudflared tunnel --url localhost:3000 &
else
    echo 'use zerotrust'
    sudo cloudflared service install $CF_TUNNEL_KEY
fi

while :
do
    #if [[ $(sudo systemctl show clamav-daemon.service -p ActiveState) =~ "ActiveState=active" ]]; then
        node index.js
    #fi
    sleep 1
done