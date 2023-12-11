
Puertos que deben quedar abiertos:
8081 NodeServer: http://127.0.0.1:8081/uechat
8083 Php MyAdmin: http://127.0.0.1:8083/

Instalar:
git
docker compose
node
npm

Crear carpetas:
/server/mysql-phpmyadmin/data
/desarrollo/

en /desarrollo/ hacer:
git clone git@github.com:ejfdelgado/ejflab.git

luego cd ejflab:
npm run install

luego lanzar el docker:
docker compose up -d
