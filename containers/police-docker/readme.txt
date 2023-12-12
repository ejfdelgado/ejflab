
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
apt-get install gnupg wget -y
// docker compose

// Configurar git
git config --global user.name "Edgar Delgado"
git config --global user.email "edgar.jose.fernando.delgado@gmail.com"

// Configurar la llave para git
cd  ~/.ssh
ssh-keygen -t ed25519 -C "edgar.jose.fernando.delgado@gmail.com" -f id_ed25519_policevr
eval `ssh-agent -s`

// Crear el archivo
vi ~/.ssh/config
// Con el contenido
IdentityFile ~/.ssh/id_ed25519_policevr

ssh-add ~/.ssh/id_ed25519_policevr
vi ~/.ssh/id_ed25519_policevr.pub



// Descargar y actualizar el proyecto
cd ~/desarrollo
git clone git@github.com:ejfdelgado/ejflab.git
cd ~/desarrollo/ejflab
npm install

// Open port 8081

// Para actualizar el código:
git pull && npm run build_local

// Para correr el servidor:
npm run start


npm cache clean
rm -rf $TMPDIR/npm-*



rm -rf /usr/local/bin/npm /usr/local/share/man/man1/node* ~/.npm
rm -rf /usr/local/lib/node*
rm -rf /usr/local/bin/node*
rm -rf /usr/local/include/node*
wget https://nodejs.org/dist/v20.10.0/node-v20.10.0-linux-x64.tar.xz
tar -xf node-v20.10.0-linux-x64.tar.xz
mv ./node-v20.10.0-linux-x64/bin/* /usr/local/bin/
mv ./node-v20.10.0-linux-x64/lib/node_modules/ /usr/local/lib/


rm -rf /usr/local/bin/npm /usr/local/share/man/man1/node* ~/.npm
rm -rf /usr/local/lib/node*
rm -rf /usr/local/bin/node*
rm -rf /usr/local/include/node*
apt-get purge nodejs npm
apt autoremove
apt-get autoremove
apt-get install npm



luego lanzar el docker:
docker compose up -d
