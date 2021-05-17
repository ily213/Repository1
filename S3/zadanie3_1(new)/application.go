package main

import (
	"flag"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

//Добавить комментарии
//Logger?, обработка ошибок?, filepath.join-, response, fields, copy

var errAmount int = 0 //Переменная хранит количество ошибок

func main() {
	start := time.Now()

	var links *string = flag.String("url", "links.txt", "Path to a url file (.txt)") //Путь до исходного файла

	var logType *string = flag.String("log", "", "Path to a log file") //Путь до файла логов

	var directoryOut *string = flag.String("directory", "result/", "Path to a result directory") //Путь к папке вывода
	flag.Parse()

	if *logType != "" {
		logfile, err := os.OpenFile(*logType, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
		if err != nil {
			log.Print("Ошибка при попытке открыть log файл")
		}
		logfile.Truncate(0)
		log.SetOutput(logfile)
		log.SetPrefix("[log]")
	}
	var file, err = OpenFile(*links, *directoryOut)
	if err != nil {
		log.Printf("Ошибка при открытии файла: %v", err)
	}
	urlList, err := ReadFile(file)
	if err != nil {
		log.Printf("Ошибка при чтении файла: %v", err)
	}

	url := strings.Fields(string(urlList)) //Преобразование массива символов в массив строк
	GetFromUrl(url, directoryOut)
	log.Print("Время, затраченное на выполнение программы: " + fmt.Sprint(time.Since(start)))
	log.Print("Выполнение программы завершено.")
}

//Функция открывает файл
func OpenFile(links string, directoryOut string) (*os.File, error) {
	getfile, err := os.OpenFile(links, os.O_RDONLY, 0666)
	if err != nil {
		errAmount++
		return nil, err
	} else {
		log.Print("Исходный файл: " + links + ".")
		log.Print("Значения флагов: \n\t-url='" + links + "'\n\t-directory='" + directoryOut + "'")
		log.Print("Файл успешно открыт.")
	}
	return getfile, err
}

//Функция считывает данные из файла и помещает в массив []byte (urlList)
func ReadFile(getfile *os.File) ([]byte, error) {
	urlList, err := ioutil.ReadAll(getfile)
	if err != nil {
		errAmount++
		return nil, err
	} else {
		log.Print("Данные были успешно считаны.")
		log.Print("Количество считанных символов: " + fmt.Sprint(len(urlList)) + ".")
	}
	getfile.Close()
	return urlList, err
}

//Функция совершает GET-запрос по ссылке
func GetFromUrl(url []string, directoryOut *string) {
	for i := 0; i < len(url); i++ {
		httpdoc, err := http.Get(url[i])
		if err != nil {
			log.Print("Ошибка при GET-запросе по адресу: '" + url[i] + "'.")
			log.Printf("%v", err)
			errAmount++
			continue
		} else {
			log.Print("GET-запрос по адресу: '" + url[i] + "' успешен.")
		}
		filename := strings.TrimRight(url[i], "/")
		filename = filename[strings.LastIndex(filename, "/"):]
		filename += ".html"
		path := filepath.Join(*directoryOut, filename)
		CreateHtml(path, httpdoc)
	}
	if errAmount > 0 {
		log.Print("Количество ошибок при выполнении: " + fmt.Sprint(errAmount) + ".")
	}
}

//Функция создает HTML-файл
func CreateHtml(path string, httpdoc *http.Response) {
	file, err := os.Create(path)
	if err != nil {
		log.Print("Ошибка при создании файла " + path)
		log.Printf("%v", err)
		errAmount++
	} else {
		log.Print("Файл: " + path + " был успешно создан.")
		io.Copy(file, httpdoc.Body)
	}
	file.Close()
}
