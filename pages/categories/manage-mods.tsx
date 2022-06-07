import { useEffect, useState } from "react"
import { Button, Dialog, DialogContent, DialogTitle, Grid, IconButton, InputAdornment, Paper, Stack, TextField, Tooltip, Typography } from "@mui/material"
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Close as CloseIcon, Star as StarIcon, DoNotDisturb as DoNotDisturbIcon } from "@mui/icons-material"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import InfiniteScroll from "react-infinite-scroll-component"
import * as yup from "yup"

import { TooltipIconButton, CardWrapper, CheckboxedItem, AreYouSureDialog, PasswordField } from "../../components/common/library"
import { ProtectedPage } from "../../components/templates/page-template"
import { authorizedFetch, authorizedJSONFetch } from "../../utils/fetcher"
import { RequestState, useRequest, useRequestor } from "../../utils/requestor"
import { isEmpty, ModPerm } from "../../utils/other"
import { useAppSelector } from "../../data/hooks"
import { useRouter } from "next/router"

interface ModeratorData {
  id: number
  username: string
  superuser: boolean
  permissions: number[]
}

interface ModeratorDialogProps {
  open: boolean
  onClose: () => void
  updateModerator: (id: number, data?: ModeratorData) => void
}

interface RemoveModeratorDialogProps extends ModeratorDialogProps {
  data: ModeratorData
}

function RemoveModeratorDialog({ data, open, onClose, updateModerator }: RemoveModeratorDialogProps) {
  const router = useRouter()

  function confirm() {
    authorizedFetch(`/moderators/${data.id}/`, { method: "delete" })
      .then(response => {
        if (response.ok) {
          updateModerator(data.id)
          onClose()
        }
        else {
          console.log("Error!", response.status)
          response.json().then(console.log)
          router.push("/signin/")
        }
      })
  }

  return <AreYouSureDialog
    open={open}
    confirm={confirm}
    cancel={onClose}
  >
    <Typography variant="body1">
      Do you really want to remove moderator {data.username}?
    </Typography>
    <Typography variant="body1" color="error">
      You won't be able to undo this action
    </Typography>
  </AreYouSureDialog>
}

function schemaFactory(newEntry: boolean) {
  return yup
    .object({
      username: yup.string().max(100).required(),
      password: newEntry ? yup.string().max(100).required() : yup.string().max(100),
    })
    .required()
}

interface EditModeratorDialogProps extends ModeratorDialogProps {
  data?: ModeratorData
  globalPermissions: ModPerm[]
}

function EditModeratorDialog({ data, open, onClose, globalPermissions, updateModerator }: EditModeratorDialogProps) {
  const newEntry = data === undefined
  const myPerms: undefined | number[] = useAppSelector(state => state.moderator.permissions?.map(item => item.id))
  const initialPerms: number[] = data === undefined ? [] : data.permissions

  const [permissions, setPermissions] = useState<number[]>(() => initialPerms)
  const { control, handleSubmit, formState: { errors }, reset: resetForm } = useForm(
    { resolver: yupResolver(schemaFactory(newEntry)), })

  const usernameError = !!errors?.username?.type
  const passwordError = !!errors?.password?.type
  const anyError = usernameError || passwordError

  const errorDescription: string[] = []
  if (anyError) {
    if (usernameError) {
      if (errors?.username?.type === "max") errorDescription.push("Username is too long")
      if (errors?.username?.type === "required") errorDescription.push("Username is required")
    }
    if (passwordError) {
      if (errors?.password?.type === "max") errorDescription.push("Password is too long")
      if (errors?.password?.type === "required") errorDescription.push("Password is required")
    }
  }

  function close() {
    setPermissions(initialPerms)
    resetForm()
    onClose()
  }

  const submit = handleSubmit((newData: any) => {
    if (newData.username === data?.username) delete newData.username
    if (isEmpty(newData.password)) delete newData.password

    newData["append-perms"] = permissions.filter(x => !initialPerms.includes(x))
    newData["remove-perms"] = initialPerms.filter(x => !permissions.includes(x))

    console.log(newData)

    if (newData.username || newData.password || newData["append-perms"].length > 0 || newData["remove-perms"].length > 0) {
      authorizedJSONFetch(newEntry ? "/moderators/" : `/moderators/${data.id}/`, newData, { method: "post" })
        .then((response) => {
          if (response.ok) response.json().then(serverData => {
            if (newEntry) {
              updateModerator(serverData.id, { ...serverData, permissions: serverData.permissions.map((p: ModPerm) => p.id) })
              setPermissions(initialPerms)
              resetForm()
            } else {
              updateModerator(data.id, { ...data, ...newData, permissions })
            }
            onClose()
          })
          else {
            console.log("Error!")  // TODO improve
            response.json().then(console.log)
            close()
          }
        })
    } else onClose()
  })

  return <Dialog open={open}>
    <DialogTitle>
      {newEntry ? "New" : "Editing"} moderator
      <IconButton
        onClick={close}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent>
      <Controller
        name="username"
        control={control}
        defaultValue={data?.username === undefined ? "" : data?.username}
        render={({ field }) => (
          <TextField
            sx={{ width: "100%", }}
            label="Username"
            error={usernameError}
            fullWidth
            margin="normal"
            {...field}
            ref={null}
          />
        )}
      />
      <Controller
        name="password"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <PasswordField
            sx={{ width: "100%", }}
            label="New Password"
            autoComplete="none"
            error={passwordError}
            fullWidth
            margin="normal"
            {...field}
            ref={null}
          />
        )}
      />
      {anyError && errorDescription
        .map((item, key) => <Typography
          sx={{ mt: 1 }}
          variant="body1"
          color="error"
          key={key}
        >
          {item}
        </Typography>)
      }
      <Paper sx={{ mt: 2, overflowY: "auto", maxHeight: 300 }}>
        <Stack
          direction="column"
          justifyItems="center"
          alignItems="center"
        >
          {globalPermissions.map((perm, key) =>
            <CheckboxedItem
              key={key}
              disabled={!myPerms?.includes(perm.id)}
              disabledText="Can't edit this permission"
              fullWidth
              text={perm.name}
              checked={permissions.includes(perm.id)}
              setChecked={(value) => {
                if (value) setPermissions([perm.id, ...permissions])
                else setPermissions(permissions.filter((v) => v !== perm.id))
              }}
            />
          )}
        </Stack>
      </Paper>
      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
        onClick={submit}
      >
        {newEntry ? "Create" : "Save"}
      </Button>
    </DialogContent>
  </Dialog>
}

const cardHeight: number = 60

interface ModeratorCardProps {
  data: ModeratorData
  globalPermissions: ModPerm[]
  updateModerator: (id: number, data?: ModeratorData) => void
}

function SuperuserCard({ data }: ModeratorCardProps) {
  return <Tooltip title="Use CLI to edit superusers">
    <Paper>
      <Stack direction="row" spacing={1} sx={{ p: 1, alignItems: "center", justifyContent: "center", height: cardHeight }}>
        <StarIcon color="warning" />
        <Typography flexGrow={1} variant="body1">
          {data.username}
        </Typography>
        <DoNotDisturbIcon color="error" />
      </Stack>
    </Paper>
  </Tooltip>
}

function ModeratorCard({ data, ...other }: ModeratorCardProps) {
  const [hover, setHover] = useState<boolean>(false)
  const [editing, setEditing] = useState<boolean>(false)
  const [removing, setRemoving] = useState<boolean>(false)

  return <>
    <RemoveModeratorDialog data={data} open={removing} onClose={() => setRemoving(false)} {...other} />
    <EditModeratorDialog data={data} open={editing} onClose={() => setEditing(false)} {...other} />
    <Paper
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ p: 1, alignItems: "center", justifyContent: "center", height: cardHeight }}
      >
        {hover && <TooltipIconButton
          onClick={() => setEditing(true)}
          title="Edit Permissions"
          Icon={EditIcon}
        />}
        <Typography
          variant="body1"
          flexGrow={1}
          sx={{ p: 1, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}
        >
          {data.username}
        </Typography>
        {hover && <TooltipIconButton
          onClick={() => setRemoving(true)}
          title="Remove Moderator"
          Icon={DeleteIcon}
        />}
      </Stack>
    </Paper>
  </>
}

function ModeratorCardSwitch(props: ModeratorCardProps) {
  if (props.data.superuser) return <SuperuserCard {...props} />
  return <ModeratorCard {...props} />
}

export default function ManageMods() {
  const [creating, setCreating] = useState<boolean>(false)

  const { data: globalPermissions, code: code1 } = useRequest("/permissions/")

  const [moderators, setModerators] = useState<ModeratorData[]>([])
  const [hasNext, setHasNext] = useState<boolean>(false)
  const [code2, setCode2] = useState<number>(0)

  const { protectedRequest } = useRequestor(({ code, data: { results, "has-next": hasMore } }: RequestState) => {
    setModerators([...moderators, ...results.map((x: any) => ({ ...x, permissions: x.permissions.map((p: ModPerm) => p.id) }))])
    setHasNext(hasMore)
    setCode2(code)
  })

  function loadMore() {
    protectedRequest("/moderators/?offset=" + moderators.length.toString())
  }
  useEffect(loadMore, [setModerators, setHasNext])

  function updateModerator(newModId: number, newMod?: ModeratorData) {
    const newModerators = [...moderators]
    const index = moderators.findIndex(mod => mod.id === newModId)
    if (newMod === undefined) {
      newModerators.splice(index, 1)
    } else if (index !== -1) {
      newModerators.splice(index, 1, newMod)
    } else {
      newModerators.splice(0, 0, newMod)
    }
    setModerators(newModerators)
  }

  return <ProtectedPage code={code1 === 200 ? code2 : code1} title="Moderator Management | MUB">
    <EditModeratorDialog open={creating} onClose={() => setCreating(false)} globalPermissions={globalPermissions} updateModerator={updateModerator} />
    <Stack sx={{ maxWidth: 1200, width: "100%", m: "auto", py: 4, px: 2, textAlign: "center" }} direction="column">
      <Typography variant="h4" sx={{ mb: 2 }}>
        Superuser: Moderator Management
      </Typography>
      {moderators !== undefined &&
        <InfiniteScroll
          dataLength={moderators.length}
          next={loadMore}
          hasMore={hasNext === true}
          loader={<h4>Loading...</h4>}
        >
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <CardWrapper height={cardHeight} onClick={() => setCreating(true)}>
                <AddIcon />
              </CardWrapper>
            </Grid>
            {(moderators)?.map(
              (data, index) => <Grid item xs={3} key={index}>
                <ModeratorCardSwitch data={data} globalPermissions={globalPermissions} updateModerator={updateModerator} />
              </Grid>
            )}
          </Grid>
        </InfiniteScroll>
      }
    </Stack>
  </ProtectedPage >
}