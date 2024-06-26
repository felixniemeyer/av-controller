yarn build && ( echo 'copying to pc' ; rsync -av --checksum dist/  -e 'ssh -p 23' dist/ 192.168.89.13:/home/felix/fusion/av-controller/ )
