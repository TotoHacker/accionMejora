pipeline {
    agent any

    environment {
        VERCEL_TOKEN = credentials('vercel-token')
        VERCEL_ORG = "totohackers-projects"
        VERCEL_PROJECT = "accion-mejora"
    }

    stages {

        stage('Checkout') {
            steps {
                git url: 'https://github.com/TotoHacker/accionMejora.git', branch: 'main'
            }
        }

        stage('Install Node & Dependencies') {
            steps {
                sh 'node -v || true'
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy to Vercel') {
            steps {
                sh '''
                    npm install -g vercel
                    vercel --token=$VERCEL_TOKEN --prod --yes
                '''
            }
        }
    }
}
