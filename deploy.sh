pushd ../api/
yarn install
popd

rm -rf cdk.out/*
cdk deploy --profile tmtam
