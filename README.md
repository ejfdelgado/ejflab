# Ejflab1

git config --global user.name "Edgar Delgado"
git config --global user.email "edgar.jose.fernando.delgado@gmail.com"
gcloud config set account edgar.jose.fernando.delgado@gmail.com
export GOOGLE_APPLICATION_CREDENTIALS=/home/ejfdelgado/desarrollo/ejflab/llaves/ejfexperiments-c2ef2a890ca5.json
gcloud projects list --sort-by=projectId --limit=5
gcloud config set project ejfexperiments
export ENV=env

gcloud auth login
