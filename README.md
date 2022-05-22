# Programming 4 - Share A Meal API

![image](https://img.shields.io/github/downloads/KasperVanDenEnden/Programming-4/total?logo=GitHub&style=plastic) 
![GitHub deployments](https://img.shields.io/github/deployments/KasperVanDenEnden/Programming-4/Heroku?label=Heroku&logo=Heroku&logoColor=%23E6E6FA)

## Table of Contents

 - [About the API](#about-the-api)
 - [Badges](#badges)
    - [Packages used for production](#packages-used-for-production)
    - [Packages used for testing](#packages-used-for-testing)
    - [Languages](#languages)
    - [Workenvironments](#workenvironments)
    - [Other](#other
 - [Visuals](#visuals)
 - [Installation](#)
    - [Connectiion Github with Heroku](#)
    - [Connectie with MYSQL database](#)
 - [Usage](#usage)
 - [API Reference](#api-reference)
    - [Create user and login](#create-user-and-login)
    - [Users](#users)
    - [Meals](#meals)
 - [Support](#)
 - [Roadman](#)
 - [Contributors](#)
 - [Authors and acknowledgment](#authors-and-acknowlegment)
 - [License](#license)
 - [Project status](#project-status)


## About the API
In dit project is er gebruik gemaakt van javascript om een API gemaakt om "Gebruikers" en "Maaltijden" aan te maken. 
Deze objecten worden opgeslagen in een online database en is het verder ook mogelijk deze objecten op te vragen, aan te passen en te verwijderen. Voor sommige functies moet een authenticatie plaatsvinden en moet je een "Gebruiker" zijn.
Om de API online te zetten wordt via GitHub de API naar Heroku gedeployed. Via Postman is getest of de responses werken en via een online assertion tool is gekeken of de vereiste testcases slagen.

## Badges
### Packages used for production
![image](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![image](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![image](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)
![image](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
### Packages used for testing
![image](https://img.shields.io/badge/Mocha-8D6748?style=for-the-badge&logo=Mocha&logoColor=white)
![image](https://img.shields.io/badge/chai-A30701?style=for-the-badge&logo=chai&logoColor=white)
### Workenvironments
![image](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=Postman&logoColor=white)
![image](https://img.shields.io/badge/Heroku-430098?style=for-the-badge&logo=heroku&logoColor=white)
![image](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![image](https://img.shields.io/badge/Xampp-F37623?style=for-the-badge&logo=xampp&logoColor=white)
![image](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)
![image](https://img.shields.io/badge/Visual_Studio-5C2D91?style=for-the-badge&logo=visual%20studio&logoColor=white)
### Languages
![image](https://img.shields.io/badge/json-5E5C5C?style=for-the-badge&logo=json&logoColor=white)
![image](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)

### Other
![image](https://img.shields.io/badge/prettier-1A2C34?style=for-the-badge&logo=prettier&logoColor=F7BA3E)

## Visuals
Depending on what you are making, it can be a good idea to include screenshots or even a video (you'll frequently see GIFs rather than actual videos). Tools like ttygif can help, but check out Asciinema for a more sophisticated method.

## Installation
### Connection Github with Heroku
```
 1. Maak een Heroku account.
 2. Ga naar account setting en copy de API Key.
 3. Ga naar de settings van je Github repository en open de Environments.
 4. Maar een nieuwe environment aan genaamd "Heroku".
 5. Maak een secret aan genaam "HEROKU_API_KEY" en plak in de value je API key.
 6. Maak een secret aan genaam "HEROKU_USER_EMAIL" en zet daar je email van Heroku in de value
 6. Maak een secret aan genaam "HEROKU_APP_NAME" en zet daar je naam van de Heroku applicatie in de value
```
 LET OP!!: zorg ervoor dat actions zijn toegestaan in de settings van je repository

### Connection with MYSQL database
```
1. 
2. 
3.
```


## Usage
Use examples liberally, and show the expected output if you can. It's helpful to have inline the smallest example of usage that you can demonstrate, while providing links to more sophisticated examples if they are too long to reasonably include in the README.

## API Reference

[I'm a link to the Heroku deployed project](https://share-a-meal-2101787.herokuapp.com/)

The references below, you can paste them behind te url the link above will lead you to.
#### Create user and login

```http
1. POST /api/user
2. POST /api/aut/login
```
| Nr    | Parameter | Type     | Description                | Locked with login |
| :---- | :-------- | :------- | :------------------------- | :---- |
| 1.    | `user` | `object` | **Required**. Needs all (valid) attributes in body | False |
| 2.    | `user` | `object` | **Required**. Valid Email & Password in body | False  |


#### Users

```http
  1. GET /api/user
        a. ?firstName={string}&isActive{true|false}
  2. GET /api/user/${id}
  3. GET /api/user/profile
  4. PUT /api/user/${id}
  5. DELETE /api/user/${id}
```

|   Nr  | Parameter | Type     | Description                | Locked with login |
| :---- | :-------- | :------- | :------------------------- | :---- |
|  1.   | `firtName` | `string` | **Not Required**. A firstname | True  |
|  1.   | `isActive` | `boolean` | **Not Required**. true or false | True  |
|  2.   | `id` | `int` | **Required**. Your API key | True  |
|  3.   | `Login` | `login` | **Required**. Login is required to find a profile | True  |
|  4.   | `id` | `int` | **Required**. Id of user to update | True  |    
|  5.   | `id` | `int` | **Required**. Id of meal to delete | True  |

#### Meals

```http
  1. POST /api/meal
  2. GET /api/meal
  3. GET /api/meal/${id}
  4. DELETE /api/meal
  
```

|  Nr   | Parameter | Type     | Description                       | Locked with login |
| :---- | :-------- | :------- | :-------------------------------- | :--- |
|  1.   | `id`      | `object` | **Required**. Id of meal to create | True |
|  3.   | `id`      | `int` | **Required**. Id of meal to fetch | True |
|  4.   | `id`      | `int` | **Required**. Id of meal to fetch | True |


## Support
Als er vragen zijn over dit project, kunt u een vraag stellen via k.vandenenden1@student.avans.nl

## Roadmap
Mogelijke toekomstige functionaliteiten
```
1. Maaltijden aanpassen
2. Aanmelden voor een maaltijd
3. Afmelden voor een maaltijd
4. Lijst van deelnemers opvragen voor een maaltijd
5. Details van een deelnemer opvragen
```

## Contributing
Dit is een schoolproject dat in mijn portfolio zal worden opgenomen. Daarom zal het niet mogelijk zijn door andere partijen aanpassingen te maken in dit project. Sta wel vrij om dit project te "forken" en er zelf mee aan de slag te gaan.

## Authors and acknowledgment
Ik wil mijn docenten bedanken voor de goede uitleg, zodat het voor mij duidelijk was hoe ik dit schoolproject moest aanpakken.

## License
See LICENSE.txt

## Project status
Ik kan geen garantie geven dat toekomstige functionaliteiten gerealiseerd zullen worden die op de roadmap staan. Dit heeft ermee te maken dat naast dit project andere projecten zullen lopen na de oplevering. Mocht het mogelijk zijn zal ik proberen er een hobbyprojectje van te maken.





