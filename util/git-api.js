module.exports = {
    templateRepo: 'https://api.github.com/orgs/elegantTemplate/repos',
    /**
     * 
     * @param {String} e download repo name
     */
    templateDownload(e) {
        return `https://github.com/elegantTemplate/${e}/archive/master.zip`
    }
}