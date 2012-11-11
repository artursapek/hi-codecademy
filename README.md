# maps-hack

A maps UI that's going to support markers and intertial scrolling. Built with Django/MongoDB/JavaScript for codecademy to see <3

### Running it
```
git clone https://github.com/artursapek/hi-codecademy.git
cd hi-codecademy
python manage.py runserver 8000
```

### Generating your own map
Save your map in three resolutions as `map.1.png`, `map.2.png`, and `map.3.png` in `src/assets/`.

Clear the `src/assets/img/tiles` folder and run `python src/generate_tiles.py`.

Note: The images you save should be in resolutions progressively double in size. EG map.1.png is half the size of map.2.png. Ideally, the largest size, map.3.png, is of a resolution divisible by 400px in both directions.
