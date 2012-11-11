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
