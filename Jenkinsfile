pipeline {
  agent {
    kubernetes {
      yamlFile 'jenkins-pod.yaml'
    }
  }

  environment {
    VERCEL_TOKEN = credentials('MrAnAlNlyFfjsru96UNEVY9W')
    VERCEL_ORG = "totohackers-projects"
    VERCEL_PROJECT = "accion-mejora"
  }

  stages {

    stage('Checkout') {
      steps {
        git url: 'https://github.com/TotoHacker/accionMejora', branch: 'main'
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
