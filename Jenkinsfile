pipeline {
  agent {
    kubernetes {
      yamlFile 'jenkins-pod.yaml'
    }
  }

  environment {
    VERCEL_TOKEN = credentials('vercel-token')
    VERCEL_ORG = "tu-org"
    VERCEL_PROJECT = "pokemon-pwa"
  }

  stages {

    stage('Checkout') {
      steps {
        git url: 'https://github.com/tu/repo.git', branch: 'main'
      }
    }

    stage('Install dependencies') {
      steps {
        container('node') {
          sh 'npm install'
        }
      }
    }

    stage('Build') {
      steps {
        container('node') {
          sh 'npm run build'
        }
      }
    }

    stage('Deploy to Vercel') {
      steps {
        container('node') {
          sh '''
            npm install -g vercel

            vercel deploy dist \
              --token=$VERCEL_TOKEN \
              --org=$VERCEL_ORG \
              --project=$VERCEL_PROJECT \
              --prod \
              --yes
          '''
        }
      }
    }
  }
}
