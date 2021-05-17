package main

import (
	"flag"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"
)

var errAmount int = 0
var logger *log.Logger

func main() {
	channel := make(chan int)
	start := time.Now()
	logfile, err := os.OpenFile("Logs/logfile.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Print("Ошибка при попытке открыть log файл")
	}
	logger = log.New(logfile, "[log] ", log.LstdFlags)

	var links *string = flag.String("url", "links.txt", "Path to a url file (.txt)")

	var directoryOut *string = flag.String("directory", "result/", "Path to a result directory")
	flag.Parse()

	urlList := ReadFile(OpenFile(*links, *directoryOut))
	url := strings.Fields(string(urlList))
	GetFromUrl(url, directoryOut, channel)
	if errAmount > 0 {
		WriteToLogs("Количество ошибок при выполнении: " + fmt.Sprint(errAmount) + ".")
	}
	WriteToLogs("Время, затраченное на выполнение программы: " + fmt.Sprint(time.Since(start)))
	WriteToLogs("Выполнение программы завершено.\n---------------------------------------")
}

func OpenFile(links string, directoryOut string) *os.File {
	getfile, err := os.OpenFile(links, os.O_RDONLY, 0666)
	if err != nil {
		WriteToLogs("Ошибка при открытии файла." + links)
		errAmount++
	} else {
		WriteToLogs("Исходный файл: " + links + ".")
		WriteToLogs("Значения флагов: \n\t-url='" + links + "'\n\t-directory='" + directoryOut + "'")
		WriteToLogs("Файл успешно открыт.")
	}
	return getfile
}

func ReadFile(getfile *os.File) []byte {
	urlList, err := ioutil.ReadAll(getfile)
	if err != nil {
		WriteToLogs("Ошибка при чтении файла.")
		errAmount++
	} else {
		WriteToLogs("Данные были успешно считаны.")
		WriteToLogs("Количество считанных символов: " + fmt.Sprint(len(urlList)) + ".")
	}
	getfile.Close()
	return urlList
}

func CreateHtml(path string, httpdoc *http.Response) {
	file, err := os.Create(path)
	if err != nil {
		WriteToLogs("Ошибка при создании файла." + path)
		errAmount++
	} else {
		WriteToLogs("Файл: " + path + " был успешно создан.")
		io.Copy(file, httpdoc.Body)
	}
	file.Close()
}

func GetFromUrl(url []string, directoryOut *string, channel chan int) {
	var waiting sync.WaitGroup
	waiting.Add(len(url))
	for i := 0; i < len(url); i++ {
		go func(i int) {
			httpdoc, err := http.Get(url[i])
			if err != nil {
				WriteToLogs("Ошибка при GET-запросе по адресу: '" + url[i] + "'.")
				errAmount++
				return
			} else {
				WriteToLogs("GET-запрос по адресу: '" + url[i] + "' успешен.")
			}
			filename := strings.TrimRight(url[i], "/")
			filename = filename[strings.LastIndex(filename, "/"):]
			path := *directoryOut + filename + ".html"
			CreateHtml(path, httpdoc)
			waiting.Done()
		}(i)
	}
	waiting.Wait()
}

func WriteToLogs(logText string) {
	log.Print(logText)
	logger.Print(logText)
}
