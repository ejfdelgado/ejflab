# Ejflab1

git config --global user.name "Edgar Delgado"
git config --global user.email "edgar.jose.fernando.delgado@gmail.com"
gcloud config set account edgar.jose.fernando.delgado@gmail.com
export GOOGLE_APPLICATION_CREDENTIALS=/home/ejfdelgado/desarrollo/ejflab/llaves/ejfexperiments-c2ef2a890ca5.json
gcloud projects list --sort-by=projectId --limit=5
gcloud config set project ejfexperiments
gcloud projects get-iam-policy ejfexperiments
export ENV=pro


export GOOGLE_APPLICATION_CREDENTIALS=/home/ejfdelgado/desarrollo/ejflab/llaves/ejfexperiments-f1c7c49b937c.json

gcloud auth login
gcloud auth activate-service-account dev-600@ejfexperiments.iam.gserviceaccount.com --key-file=/home/ejfdelgado/desarrollo/ejflab/llaves/ejfexperiments-f1c7c49b937c.json

sudo docker build --platform linux/x86_64 -t ejfdelgado/mainapp:v1.0 .
Successfully tagged ejfdelgado/mainapp:v1.0

sudo docker images

sudo docker run --platform linux/x86_64 -a STDERR -a STDOUT -i --rm --name mainapp -p 80:8080 -p 41061:22 ejfdelgado/mainapp:v1.0

ssh root@localhost -p 41061
//use password root

sudo docker ps

sudo docker kill 7bfe7bcc214d
sudo docker stop e50ad27074a7

sudo docker container prune 

sudo docker login -u ejfdelgado 

sudo docker push ejfdelgado/mainapp:v1.0

gcloud auth configure-docker

sudo docker tag ejfdelgado/mainapp:v1.0 gcr.io/ejfexperiments/mainapp:v1.0
docker push gcr.io/ejfexperiments/mainapp:v1.0






sudo docker build --platform linux/x86_64 -t gcr.io/ejfexperiments/mainapp:v1.2 .
docker push gcr.io/ejfexperiments/mainapp:v1.2
sudo docker run --platform linux/x86_64 -a STDERR -a STDOUT -i --rm --name mainapp -p 80:8080 gcr.io/ejfexperiments/mainapp:v1.2