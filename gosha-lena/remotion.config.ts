import { Config } from '@remotion/cli/config';
// Ассеты (персонажи, шрифты, озвучка, звуки) лежат в assets/ и доступны через staticFile()
Config.setPublicDir('./assets');
Config.setVideoImageFormat('jpeg');
Config.setBrowserExecutable('/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell');
