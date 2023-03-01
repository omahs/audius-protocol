package cmd

import (
	"encoding/json"
	"fmt"

	"github.com/spf13/cobra"
)

var jobCmd = &cobra.Command{
	Use:   "job",
	Short: "",
	Long:  ``,
	Run: func(cmd *cobra.Command, args []string) {
		if len(args) < 1 {
			return
		}

		jobId := args[0]

		clientCount, err := initClients()
		if err != nil || clientCount < 1 {
			fmt.Println("Couldn't find any clients")
			return
		}

		client := ClientList[0]
		job, err := client.GetJob(jobId)
		if err != nil {
			fmt.Printf("getting job error, %+v\n", job)
			return
		}


		prettyPrintJob, err := json.MarshalIndent(job, "", "  ")
		if err != nil {
			return
		}

		fmt.Printf("%s\n", string(prettyPrintJob))
	},
}

func init() {
	storageCmd.AddCommand(jobCmd)
}
