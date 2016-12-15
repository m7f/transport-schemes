### Тема проекта: Cоздание схем общественного транспорта на основе геоданных
#### Флоринский Михаил Константинович, группа 152

За основу проектной работы взяты маршруты общественного транспорта Санкт-Петербурга.

Проблема визуализации маршрутов общественного транспорта является актуальной в наши дни:  крупные города имеют развитую транспортную инфраструктуру и каждый из них требует схему своих маршрутов.
Большинство схем делаются вручную: некоторые выполнены профессиональными дизайнерами, а некоторые изображены как есть, без художественных допущений и дизайнерских решений, чаще руководствуясь наложением на карту.

Дизайнерские схемы выглядят великолепно, но требуют огромных затрат сил и времени. К примеру, внимания заслуживает схема Московского метрополитена, процесс создания которой [описывается](https://www.artlebedev.ru/metro/map3/) на сайте студии Артемия Лебедева. 

![img](https://img.artlebedev.ru/everything/metro/map3/process-5/metro-map3-process4-first-step-01.gif)
Поражает внимание к мелким деталям, из которых и складывается красота карты.

![img](https://img.artlebedev.ru/everything/metro/map3/process-2/metro-map-2016-process-intr-emphasis-5-1.gif)

Схемы, наложенные на карту, не требуют таких затрат, но имеют существенные недостатки:
* нагромождение параллельных маршрутов

![img](http://www.saletur.ru/galery/tfoto_map/big/3040.jpg)
* неграмотно подобранная палитра цветов

![img](http://gorod-orel.ru/transport/imgtransport/karta-trolley.gif)
* запутанность линий в местах их скопления

![img](http://www.200stran.ru/images/maps/1243333691_92ade9.jpg)
* много как лишнего текста, так и неиспользованных пустот

![img](http://artgorbunov.ru/bb/soviet/20160105/london-night-buses@fx.png)


Как результат, в них очень сложно разобраться простому пассажиру и выглядят они сложными и непонятными. Данная проблема [рассматривается](http://artgorbunov.ru/bb/soviet/20160105/) в цикле статей Ильи Бирмана.

Возвращаясь к рассматриваемому нами городу, схема трамвайных маршрутов в Санкт-Петербурге выглядит вот так:
![img](http://img.tourister.ru/files/8/7/4/8/9/0/1/original.gif)
Эту схему хочется упростить.

Автоматизация данного процесса значительно улучшит качество и простоту схем, сократив расходы на их разработку. В итоге получатся минималистичные и содержательные схемы, не уступающие ведущим дизайнерским.

### Используемые технологии

Реализован проект будет в виде web-приложения, при помощи связки html + css + js. В нашем случае это важно, так как нас интересует не только backend, но и frontend. Также будет использоваться NodeJS - серверная реализация JavaScript. Многие библиотеки оттуда значительно упрощат работу. Географические данные будут взяты из [Open Street Map](http://openstreetmap.ru/) и [OverPass API](https://overpass-turbo.eu/) с применением языка запросов Overpass QL.
Данные об остановках и маршрутах можно будет найти на официальных сайтах Санкт-Петербурга, туристических или в Википедии.

### План

Все фичи будущего проекта можно разбить на пять категорий, каждая оценена сложностью по шкале от 1 до 5, порядок по приоритету:

* Сбор данных
    * [Open Street Map](http://openstreetmap.ru/)
    * [OverPass](https://overpass-turbo.eu/)
    * [Wikipedia](https://ru.wikipedia.org/wiki/%D0%9E%D0%B1%D1%89%D0%B5%D1%81%D1%82%D0%B2%D0%B5%D0%BD%D0%BD%D1%8B%D0%B9_%D1%82%D1%80%D0%B0%D0%BD%D1%81%D0%BF%D0%BE%D1%80%D1%82_%D0%A1%D0%B0%D0%BD%D0%BA%D1%82-%D0%9F%D0%B5%D1%82%D0%B5%D1%80%D0%B1%D1%83%D1%80%D0%B3%D0%B0)
    * [Официальный сайт города](http://transport.orgp.spb.ru/)
    * [Неофициальные источники](http://pitertransport.com/)
* Дизайн
    * Группировка параллельных маршрутов [1/5]
    * Автоматический подбор приятных и несливающихся цветов линий [1/5]
    * Упрощение линий [2/5]
* Алгоритмы
    * Поиск кратчайшего пути между двумя остановками [1/5]
    * Список станций, до которых можно доехать за заданное время [1/5]
    * Можно прикрутить нейросеть, которая будет определять координаты остановок, максимально совмещая схожесть с реальной картой и дизайнерские решения [5/5]
* Пользователь
    * Отрисовка схемы [3/5]
    * После выбора пункта отправления и пункта назначения выводит список ближайших рейсов [2/5]
    * Краткая информация о каждой остановке по запросу [2/5]
    * Текущие тарифы на проезд [3/5]
    * Последние актуальные новости о станциях [3/5]
    * Мобильная версия приложения на платформе Android [5/5]
* Особое
    * Ближайшие к остановке достопримечательности, книжные магазины и прочее по запросу [3/5]
    * Отображение положения транспорта в реальном времени [4/5]
    * Посмотреть, как схема выглядела бы в прошлом [5/5]
    

Источники:
* https://www.artlebedev.ru/metro/map3/
* http://artgorbunov.ru/bb/soviet/20160105/
* http://img.tourister.ru/files/8/7/4/8/9/0/1/original.gif
* http://www.saletur.ru/galery/tfoto_map/big/3040.jpg
* http://gorod-orel.ru/transport/imgtransport/karta-trolley.gif
* http://www.200stran.ru/images/maps/1243333691_92ade9.jpg
* http://transport.orgp.spb.ru/
* http://pitertransport.com/
