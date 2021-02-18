/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import isEqual from 'lodash/isEqual'
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Heading, Box, ButtonOutline, TextArea } from '@looker/components'
import { SandboxStatus } from '../SandboxStatus'
import { getCoreSDK2 } from '@looker/extension-sdk-react'
import { Looker40SDK } from '@looker/sdk'
import pptxgen from "pptxgenjs"

const CoreSDKFunctions = () => {
  const [imageData, setImageData] = useState<string>()
  const location = useLocation()
  const [routeData, setRouteData] = useState<any>({})
  const [messages, setMessages] = useState('')
  const sdk = getCoreSDK2<Looker40SDK>()

  useEffect(() => {
    if (location.search || location.pathname.includes('?')) {
      const route = `${location.pathname}${location.search}`
      if (
        routeData.route !== route ||
        !isEqual(routeData.routeState, location.state)
      ) {
        setRouteData({ route, routeState: location.state })
        updateMessages(
          `location: ${location.pathname}${location.search} ${JSON.stringify(
            location.state
          )}`
        )
      }
    }
  }, [location])

  const updateMessages = (message: string, error?: any) => {
    setMessages((prevMessages) => {
      const maybeLineBreak = prevMessages.length === 0 ? '' : '\n'
      const fullMessage = error ? `${message}\n${error}` : message
      return `${prevMessages}${maybeLineBreak}${fullMessage}`
    })
  }

  const getLooks = async () => {
    try {
      const value = await sdk.ok(sdk.folder_looks('5', 'id'))
      updateMessages(JSON.stringify(value, null, 2))
    } catch (error) {
      updateMessages('Error getting looks', error)
    }
  }

    const getMe = async () => {
    try {
      const value = await sdk.ok(sdk.me())
      updateMessages(JSON.stringify(value, null, 2))
    } catch (error) {
      updateMessages('Error getting user', error)
    }
  }

  const allConnectionsClick = async () => {
    try {
      const value = await sdk.ok(sdk.all_connections())
      value.forEach((connection: any) => {
        updateMessages(connection.name || '')
      })
    } catch (error) {
      updateMessages('Error getting connections', error)
    }
  }

  const rawLookImageClick = async () => {
    try {
      const looks = await sdk.ok(sdk.all_looks())
      if (looks.length > 1) {
        const value: any = await sdk.ok(
          sdk.run_look({
            look_id: looks[1].id!,
            result_format: 'png',
          })
        )
        if (value instanceof Blob) {
          setImageData(URL.createObjectURL(value))
        } else {
          setImageData(btoa(`data:image/png;base64,${value}`))
        }
        updateMessages('Got image')
      } else {
        updateMessages('No looks to render')
      }
    } catch (error) {
      updateMessages('Error getting connections', error)
    }
  }

  const searchFoldersClick = async () => {
    try {
      const value = await sdk.ok(sdk.search_folders({ parent_id: '1' }))
      updateMessages(JSON.stringify(value, null, 2))
    } catch (error) {
      updateMessages('Error invoking search folders', error)
    }
  }

  const inlineQueryClick = async () => {
    try {
      const value = await sdk.ok(
        sdk.run_inline_query({
          result_format: 'json_detail',
          limit: 10,
          body: {
            total: true,
            model: 'thelook',
            view: 'users',
            fields: ['last_name', 'gender'],
            sorts: [`last_name desc`],
          },
        })
      )
      updateMessages(JSON.stringify(value, null, 2))
    } catch (error) {
      updateMessages('Error invoking inline query', error)
    }
  }

  const clearMessagesClick = () => {
    setMessages('')
    setImageData(undefined)
  }

  async function getImgFromFile(locURL) {
    var reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onerror = () => {
        reader.abort();
        reject(new DOMException("Problem parsing input file."));
      }    
      reader.onloadend = function() {
        resolve(reader.result);
      }
      reader.readAsDataURL(locURL); 
    });
}

  const pptxTest3 = async () => {
    try {
      // let looks = await sdk.ok(sdk.folder_looks('5', 'id'))
      // for (let look in looks){
      //   updateMessages(JSON.stringify(look, null, 2))
      // }
      const value: any = await sdk.ok(
        sdk.run_look({
          look_id: 4,
          result_format: 'png',
          // image_width: 960,
          // image_height: 540
        })
      )
     if (value instanceof Blob) {
        const imgLoc = setImageData(URL.createObjectURL(value));
      } else {
        setImageData(btoa(`data:image/png;base64,${value}`));
      }
      
     // var base64data = getImgFromFile(value);

     base64data = async event => {
        event.persist();

        if (!event.target || !event.target.files) {
          return;
        }

        this.setState({ waitingForFileUpload: true });

        const fileList = event.target.files;

        // Uploads will push to the file input's `.files` array. Get the last uploaded file.
        const latestUploadedFile = fileList.item(fileList.length - 1);

        try {
          const fileContents = await App.readUploadedFileAsText(latestUploadedFile);
          this.setState({
            uploadedFileContents: fileContents,
            waitingForFileUpload: false
          });
        } catch (e) {
          console.log(e);
          this.setState({
            waitingForFileUpload: false
          });
        }
      };

          // 1. Create a new Presentation
          let pres = new pptxgen();

          // 2. Add a Slide
          let slide = pres.addSlide();

          // 3. Add one or more objects (Tables, Shapes, Images, Text and Media) to the Slide
          let textboxText = "Hello World from PptxGenJS!";
          let textboxOpts = { x: 1, y: 1, color: '363636', fill: { color:'F1F1F1' }, align: pres.AlignH.center };
          let imgOpts = { x: 1, y: 1, align: pres.AlignH.center };
    //      slide.addText(textboxText, textboxOpts);
          slide.addImage({ data: base64data,  w:'50%',  h:'50%' });
          console.log(base64data);
          updateMessages(base64data)

          // 4. Save the Presentation
    //      pres.writeFile("Sample Presentation.pptx");
        }

     catch (error) {
          updateMessages('Error printing pptx', error)
      }
        reader.readAsDataURL(value); 
  }

  const pptxTest2 = async () => {
    try {
      var base64data;
      // let looks = await sdk.ok(sdk.folder_looks('5', 'id'))
      // for (let look in looks){
      //   updateMessages(JSON.stringify(look, null, 2))
      // }
      const value: any = await sdk.ok(
        sdk.run_look({
          look_id: 4,
          result_format: 'png',
          // image_width: 960,
          // image_height: 540
        })
      )
     if (value instanceof Blob) {
        const imgLoc = setImageData(URL.createObjectURL(value));
      } else {
        setImageData(btoa(`data:image/png;base64,${value}`));
      }
        var reader = new FileReader();
        reader.onloadend = function() {
          var base64data = reader.result.slice(5);

          // 1. Create a new Presentation
          let pres = new pptxgen();

          // 2. Add a Slide
          let slide = pres.addSlide();

          // 3. Add one or more objects (Tables, Shapes, Images, Text and Media) to the Slide
          let textboxText = "Hello World from PptxGenJS!";
          let textboxOpts = { x: 1, y: 1, color: '363636', fill: { color:'F1F1F1' }, align: pres.AlignH.center };
          let imgOpts = { x: 1, y: 1, align: pres.AlignH.center };
    //      slide.addText(textboxText, textboxOpts);
          slide.addImage({ data: base64data,  w:'50%',  h:'50%' });
          console.log(base64data);
          updateMessages(base64data)

          // 4. Save the Presentation
    //      pres.writeFile("Sample Presentation.pptx");
        }

    } catch (error) {
          updateMessages('Error printing pptx', error)
      }
        reader.readAsDataURL(value); 
  }

   const pptxTest = async () => {
    try {

      const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });

      async function runner() {

      }


      async function Main() {
         //1. Create a new Presentation
       let looks = await sdk.ok(sdk.folder_looks('5', 'id'))
       console.log(looks)
       console.log(typeof looks)
       let pngs = []
       let i = 0
       for (let look of looks){
        console.log(look.id)
        pngs[i] = await sdk.ok(
        sdk.run_look({
            look_id: look.id,
            result_format: 'png',
          })
        )
        i = i+1;         
       }

        let pres = new pptxgen();
        let j=0
        let base64data = []
        let slides = []
        for (let png of pngs){
          base64data[j] = await toBase64(png);
          base64data[j] = base64data[j].slice(5);
    //     updateMessages(base64data)

         // 2. Add a Slide
         slides[j] = pres.addSlide();

         // 3. Add one or more objects (Tables, Shapes, Images, Text and Media) to the Slide
         // let textboxText = "Hello World from PptxGenJS!";
         // let textboxOpts = { x: 1, y: 1, color: '363636', fill: { color:'F1F1F1' }, align: pres.AlignH.center };
         // let imgOpts = { x: 1, y: 1, align: pres.AlignH.center };
    //      slide.addText(textboxText, textboxOpts);

          slides[j].addImage({ data: base64data[j],  w:'50%',  h:'50%' });
        }
 
    //      4. Save the Presentation

        pres.writeFile("Sample Presentation.pptx");
      }

      runner();



     // might need this later in case something else is returned by run_look 
     // if (value instanceof Blob) {
     //    const imgLoc = setImageData(URL.createObjectURL(value));
     //  } else {
     //    setImageData(btoa(`data:image/png;base64,${value}`));
     //  }





      Main();
  
       //       reader.readAsDataURL(blb);


    } catch (error) {
          updateMessages('Error printing pptx', error)
      }
  }

  return (
    <>
      <Heading mt="xlarge">Core SDK Functions</Heading>
      <SandboxStatus />
      <Box display="flex" flexDirection="row">
        <Box display="flex" flexDirection="column" width="50%" maxWidth="40vw">
          <ButtonOutline mt="small" onClick={allConnectionsClick}>
            All connections (get method)
          </ButtonOutline>
          <ButtonOutline mt="small" onClick={searchFoldersClick}>
            Search folders (get method with parameters)
          </ButtonOutline>
          <ButtonOutline mt="small" onClick={inlineQueryClick}>
            Inline query (post method)
          </ButtonOutline>
          <ButtonOutline mt="small" onClick={rawLookImageClick}>
            Render Look image
          </ButtonOutline>
          <ButtonOutline mt="small" onClick={clearMessagesClick}>
            Clear
          </ButtonOutline>
          <ButtonOutline mt="small" onClick={getMe}>
            Get Me
          </ButtonOutline>
          <ButtonOutline mt="small" onClick={getLooks}>
            Get Looks
          </ButtonOutline>
          <ButtonOutline mt="small" onClick={pptxTest}>
            PPTX Gen
          </ButtonOutline>
          {imageData && <img src={imageData} />}
        </Box>
        <Box width="50%" p="small" maxWidth="40vw">
          <TextArea height="60vh" readOnly value={messages} />
        </Box>
      </Box>
    </>
  )
}

export default CoreSDKFunctions
