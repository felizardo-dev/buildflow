export $(cat .env | xargs)
./mvnw spring-boot:run
