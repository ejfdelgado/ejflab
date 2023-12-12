
Puertos que deben quedar abiertos:
8081 NodeServer: http://127.0.0.1:8081/uechat
8083 Php MyAdmin: http://127.0.0.1:8083/



//Crear carpetas:
mkdir -p "${HOME}/server/mysql-phpmyadmin/data"
mkdir "${HOME}/desarrollo"
mkdir "${HOME}/.ssh"

// Instalar:
apt-get install git
apt-get install vim
apt-get install nodejs
apt-get install npm
// docker compose

// Configurar git
git config --global user.name "Edgar Delgado"
git config --global user.email "edgar.jose.fernando.delgado@gmail.com"

// Configurar la llave para git
cd  ~/.ssh
ssh-keygen -t ed25519 -C "edgar.jose.fernando.delgado@gmail.com" -f id_ed25519_policevr
eval `ssh-agent -s`
ssh-add ~/.ssh/id_ed25519_policevr
vi ~/.ssh/id_ed25519_policevr.pub

// Descargar y actualizar el proyecto
cd ~/desarrollo
git clone git@github.com:ejfdelgado/ejflab.git
cd ejflab
npm run install


luego lanzar el docker:
docker compose up -d