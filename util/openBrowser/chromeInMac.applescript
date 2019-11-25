on run argv

set theUrl to argv
tell application "Google Chrome"
-- chrome open
    if it is running then
        -- the tab is not open
        set found to false
        -- set theTabIndex to -1
            -- set URL of active tab of window 0 to theURL
        repeat with theWindow in every window
            set theTabIndex to 0
            repeat with theTab in every tab of theWindow
                set theTabIndex to theTabIndex + 1
                    if theTab's URL contains theURL then
                        set found to true
                        tell theTab to reload
                    end if
            end repeat
        end repeat

        if found = false then
            -- make new window
            activate
            -- set URL of active tab of first window to theURL
            tell front window to make new tab at after (get active tab) with properties {URL: theUrl} 
        end if
        
-- chrome closed
    else
        running
        open location theURL
        -- set URL of active tab of window 1 to theURL
    end if 
end tell

end run