pipeline {
    agent none

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {
        stage('Python quality') {
            agent {
                docker {
                    image 'ghcr.io/astral-sh/uv:0.12.5-python3.12-trixie-slim'
                    reuseNode true
                }
            }
            steps {
                sh 'uv sync --frozen'
                sh 'uv run ruff check .'
                sh 'uv run mypy src tests'
            }
        }

        stage('Automated tests') {
            parallel {
                stage('Backend and integration') {
                    agent {
                        docker {
                            image 'ghcr.io/astral-sh/uv:0.12.5-python3.12-trixie-slim'
                            reuseNode true
                        }
                    }
                    steps {
                        sh 'uv sync --frozen'
                        sh '''uv run pytest -q -m "not live" \
                            --junitxml=reports/api/junit.xml'''
                    }
                }

                stage('JavaScript and UI contracts') {
                    agent {
                        docker {
                            image 'mcr.microsoft.com/playwright:v1.62.1-noble'
                            reuseNode true
                        }
                    }
                    steps {
                        sh 'npm ci'
                        sh 'npm run typecheck:ui'
                        sh 'npm run test:performance-report'
                        sh 'npm run test:ui'
                    }
                }
            }
        }

        stage('Build test containers') {
            agent any
            steps {
                sh 'docker build --target python-tests -t labos-aqa-python:${BUILD_NUMBER} .'
                sh 'docker build --target ui-tests -t labos-aqa-ui:${BUILD_NUMBER} .'
            }
        }
    }

    post {
        always {
            junit allowEmptyResults: true, testResults: 'reports/**/*.xml'
            archiveArtifacts allowEmptyArchive: true, artifacts: 'reports/**/*'
        }
    }
}
